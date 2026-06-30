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

  private async translateText(text: string, targetLang: string): Promise<string> {
    const langDesc = LANG_NAMES[targetLang];
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
      max_tokens: 1024,
    });
    return completion.choices[0]?.message?.content?.trim() ?? text;
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

  async translateAll(lang: 'qu' | 'ay' | 'shp'): Promise<{ translated: number; errors: number }> {
    const titleField   = `title${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any;
    const summaryField = `summary${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any;
    const detailField  = `detail${lang.charAt(0).toUpperCase() + lang.slice(1)}` as any;

    const lessons = await this.prisma.lesson.findMany({
      where: { deletedAt: null, [titleField]: null },
      select: { id: true, title: true, summary: true, detail: true },
    });

    this.logger.log(`Traduciendo ${lessons.length} lecciones al ${lang}...`);

    let translated = 0;
    let errors = 0;

    for (const lesson of lessons) {
      try {
        const [title, summary, detail] = await Promise.all([
          this.translateText(lesson.title, lang),
          this.translateText(lesson.summary, lang),
          this.translateText(lesson.detail, lang),
        ]);

        await this.prisma.lesson.update({
          where: { id: lesson.id },
          data: {
            [titleField]:   title,
            [summaryField]: summary,
            [detailField]:  detail,
          },
        });

        translated++;
        this.logger.log(`[${lang}] ${translated}/${lessons.length} - ${lesson.title}`);
      } catch (err) {
        errors++;
        this.logger.error(`Error traduciendo lección ${lesson.id}: ${err}`);
      }
    }

    // Also translate courses missing this language
    await this.translateCourses(lang);

    return { translated, errors };
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
