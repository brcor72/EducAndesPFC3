import Groq from 'groq-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const LANG_NAMES: Record<string, string> = {
  qu:  'Quechua (Runasimi), the indigenous language of the Andes in Peru',
  ay:  'Aymara (Aymar Aru), spoken in the Lake Titicaca region of Peru and Bolivia',
  shp: 'Shipibo-Konibo, an Amazonian indigenous language from the Ucayali region of Peru',
};

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger(TranslationsService.name);
  private groq: Groq;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.groq = new Groq({ apiKey: this.config.get<string>('GROQ_API_KEY') ?? '' });
  }

  private async translateText(text: string, targetLang: string, retries = 3): Promise<string> {
    const langDesc = LANG_NAMES[targetLang];
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are an expert translator. Translate the following educational text to ${langDesc}.
Return ONLY the translated text, no explanations, no quotes, no additional content.
Preserve technical terms in Spanish if there is no natural equivalent.
The audience is rural Andean community members learning about technology and agriculture.`,
            },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        });
        return completion.choices[0]?.message?.content?.trim() ?? text;
      } catch (err: any) {
        const is429 = err?.status === 429 || String(err).includes('429');
        if (is429 && attempt < retries - 1) {
          const wait = (attempt + 1) * 15_000;
          this.logger.warn(`Rate limit hit, esperando ${wait / 1000}s antes de reintentar...`);
          await new Promise(r => setTimeout(r, wait));
        } else {
          throw err;
        }
      }
    }
    return text;
  }

  async getStatus() {
    const [total, withQu, withAy, withShp] = await Promise.all([
      this.prisma.lesson.count({ where: { deletedAt: null } }),
      this.prisma.lesson.count({ where: { deletedAt: null, titleQu: { not: null } } }),
      this.prisma.lesson.count({ where: { deletedAt: null, titleAy: { not: null } } }),
      this.prisma.lesson.count({ where: { deletedAt: null, titleShp: { not: null } } }),
    ]);
    return {
      totalLessons: total,
      translatedQu:  withQu,
      translatedAy:  withAy,
      translatedShp: withShp,
      pendingQu:  total - withQu,
      pendingAy:  total - withAy,
      pendingShp: total - withShp,
    };
  }

  async translateAll(
    lang: 'qu' | 'ay' | 'shp',
    batch = 3,
  ): Promise<{ translated: number; errors: number; remaining: number; lastError?: string }> {
    const suffix      = lang.charAt(0).toUpperCase() + lang.slice(1);
    const titleField   = `title${suffix}` as any;
    const summaryField = `summary${suffix}` as any;
    const detailField  = `detail${suffix}` as any;

    const lessons = await this.prisma.lesson.findMany({
      where: { deletedAt: null, [titleField]: null },
      select: { id: true, title: true, summary: true, detail: true },
      take: batch,
    });

    this.logger.log(`Traduciendo ${lessons.length} lecciones al ${lang} (batch ${batch})...`);

    let translated = 0;
    let errors = 0;
    let lastError: string | undefined;

    for (const lesson of lessons) {
      try {
        const title   = await this.translateText(lesson.title, lang);
        const summary = await this.translateText(lesson.summary, lang);
        const detail  = await this.translateText(lesson.detail, lang);

        await this.prisma.lesson.update({
          where: { id: lesson.id },
          data: { [titleField]: title, [summaryField]: summary, [detailField]: detail },
        });

        translated++;
        this.logger.log(`[${lang}] ${lesson.title}`);
      } catch (err) {
        errors++;
        lastError = String(err);
        this.logger.error(`Error traduciendo lección ${lesson.id}: ${err}`);
      }
    }

    // Translate courses only when all lessons are done
    const remaining = await this.prisma.lesson.count({
      where: { deletedAt: null, [titleField]: null },
    });
    if (remaining === 0) await this.translateCourses(lang);

    return { translated, errors, remaining, lastError };
  }

  private async translateCourses(lang: 'qu' | 'ay' | 'shp') {
    const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
    const titleField = `title${suffix}` as any;
    const shortField = `short${suffix}` as any;

    const courses = await this.prisma.course.findMany({
      where: { deletedAt: null, [titleField]: null },
      select: { id: true, title: true, short: true },
    });

    for (const course of courses) {
      try {
        const [title, short] = await Promise.all([
          this.translateText(course.title, lang),
          this.translateText(course.short, lang),
        ]);
        await this.prisma.course.update({
          where: { id: course.id },
          data: { [titleField]: title, [shortField]: short },
        });
      } catch {
        // continue
      }
    }
  }
}
