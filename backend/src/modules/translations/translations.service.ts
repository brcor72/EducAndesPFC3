import OpenAI from 'openai';
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
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.get<string>('OPENAI_API_KEY') ?? '' });
  }

  private async translateText(text: string, targetLang: string, retries = 3): Promise<string> {
    const langDesc = LANG_NAMES[targetLang];
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert translator specializing in indigenous Andean languages. Translate the following educational text to ${langDesc}.
Return ONLY the translated text, no explanations, no quotes, no additional content.
Preserve technical terms in Spanish if there is no natural equivalent.
The audience is rural Andean community members learning about technology and agriculture.
Do NOT repeat phrases or words. If you are unsure of a word, use the Spanish term.`,
            },
            { role: 'user', content: text },
          ],
          temperature: 0.2,
          max_tokens: 2048,
        });
        return response.choices[0]?.message?.content?.trim() ?? text;
      } catch (err: any) {
        const isRateLimit = err?.status === 429 || String(err).includes('429');
        if (isRateLimit && attempt < retries - 1) {
          const wait = (attempt + 1) * 10_000;
          this.logger.warn(`Rate limit, esperando ${wait / 1000}s...`);
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

  async clearTranslations(lang: 'qu' | 'ay' | 'shp') {
    const suffix      = lang.charAt(0).toUpperCase() + lang.slice(1);
    const titleField   = `title${suffix}` as any;
    const summaryField = `summary${suffix}` as any;
    const detailField  = `detail${suffix}` as any;
    await this.prisma.lesson.updateMany({
      where: { deletedAt: null },
      data: { [titleField]: null, [summaryField]: null, [detailField]: null },
    });
    return { cleared: lang };
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
