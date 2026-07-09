import OpenAI from 'openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const CATEGORY_CONTEXT: Record<string, string> = {
  CAMPO: `El texto pertenece a un curso de la categoría CAMPO (agricultura, ganadería, plantas, agua, clima andino).
Términos técnicos de esta categoría que DEBES conservar en español o adaptar con su nombre quechua conocido:
- chacra / chakra (campo de cultivo) → usa "chakra"
- papa → "papa" (préstamo aceptado)
- maíz → "sara"
- quinua → "kinwa"
- llama → "llama", alpaca → "alpaca", cuy → "quwi", gallina → "wallpa"
- riego, acequia, manantial, reservorio → conservar en español si no hay equivalente natural
- helada → "qasa", lluvia → "para", sol → "inti"
- Senamhi, GPS, sensor → conservar en español`,

  NEGOCIO: `El texto pertenece a un curso de la categoría NEGOCIO (finanzas, precios, ventas, ahorro, tejidos, turismo, cocina).
Términos técnicos de esta categoría que DEBES conservar en español:
- banco, cuenta, ahorro, depósito, retiro, firma, préstamo, interés → conservar en español
- S/ (soles), precio, costo, ganancia → conservar en español
- junta, pandero → conservar en español (son instituciones culturales conocidas)
- mercado → "qhatu"
- venta → "rantiy" o conservar "venta"
- tejido → "away", manta → "lliqlla", chullo → "ch'ullu"
- RUC, DNI, factura, boleta, contrato → conservar en español
- Yape, WhatsApp, internet, marketplace → conservar en español`,

  TECNOLOGIA: `El texto pertenece a un curso de la categoría TECNOLOGÍA (computadora, internet, celular, estafas digitales).
Términos técnicos de esta categoría que DEBES conservar en español:
- celular, computadora, internet, contraseña, clave → conservar en español
- Yape, WhatsApp, Facebook, Instagram → conservar tal cual
- estafa, fraude, phishing → conservar en español
- mouse, teclado, pantalla, navegador, correo → conservar en español
- cuenta bancaria, transferencia, código → conservar en español`,

  ENERGIA: `El texto pertenece a un curso de la categoría ENERGÍA (paneles solares, electricidad rural).
Términos técnicos de esta categoría que DEBES conservar en español:
- panel solar, batería, cable, inversor, cargador → conservar en español
- voltios, watts, amperios → conservar en español
- red eléctrica, instalación, conexión → conservar en español
- celular, foco, luz → conservar en español`,
};

const LANG_BASE: Record<string, string> = {
  qu: `Eres un traductor experto en quechua chanka del Perú (variante Ayacucho-Apurímac).

REGLAS LINGÜÍSTICAS ESTRICTAS:
- Traduce ÚNICAMENTE al quechua chanka peruano (Ayacucho-Apurímac).
- PROHIBIDO usar vocabulario del kichwa ecuatoriano: no uses "ñuka", "shuk", "cana", "chaylla" repetitivo.
- PROHIBIDO mezclar variantes (no cusqueño mezclado con ecuatoriano).
- Primera persona: "ñuqa" (NUNCA "ñuka").
- Estructura gramatical SOV del quechua chanka.
- Si no conoces con certeza una palabra, conserva el término en español en lugar de inventar.
- La traducción debe sonar natural para un agricultor de Apurímac o Ayacucho.
- Préstamos siempre aceptados: DNI, banco, S/, WhatsApp, Yape, internet, nombres propios.`,

  ay: `Eres un traductor experto en aymara altiplánico del Perú (variante Puno-Lago Titicaca).

REGLAS LINGÜÍSTICAS ESTRICTAS:
- Traduce ÚNICAMENTE al aymara altiplánico (región Puno, Perú).
- La traducción debe sonar natural para un habitante de la región del Lago Titicaca.
- Si no conoces con certeza una palabra, conserva el término en español en lugar de inventar.
- Préstamos siempre aceptados: DNI, banco, S/, WhatsApp, Yape, internet, nombres propios.`,

  shp: `Eres un traductor experto en shipibo-konibo del Perú (región Ucayali).

REGLAS LINGÜÍSTICAS ESTRICTAS:
- Traduce ÚNICAMENTE al shipibo-konibo (variante Ucayali, Perú).
- La traducción debe sonar natural para un habitante de la comunidad shipibo del río Ucayali.
- Si no conoces con certeza una palabra, conserva el término en español en lugar de inventar.
- Préstamos siempre aceptados: DNI, banco, S/, WhatsApp, Yape, internet, nombres propios.`,
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

  private buildSystemPrompt(lang: string, category: string, courseTitle: string): string {
    const base = LANG_BASE[lang] ?? LANG_BASE.qu;
    const ctx  = CATEGORY_CONTEXT[category] ?? '';
    return `${base}

${ctx}

Contexto específico: Este texto pertenece al curso "${courseTitle}".

Devuelve ÚNICAMENTE el texto traducido, sin explicaciones, sin comillas, sin contenido adicional.`;
  }

  private async translateText(
    text: string,
    lang: string,
    category: string,
    courseTitle: string,
    retries = 3,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(lang, category, courseTitle);
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: text },
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
      select: {
        id: true, title: true, summary: true, detail: true,
        course: { select: { title: true, category: true } },
      },
      take: batch,
    });

    this.logger.log(`Traduciendo ${lessons.length} lecciones al ${lang} (batch ${batch})...`);

    let translated = 0;
    let errors = 0;
    let lastError: string | undefined;

    for (const lesson of lessons) {
      const courseTitle = lesson.course?.title ?? '';
      const category    = lesson.course?.category ?? 'CAMPO';
      try {
        const title   = await this.translateText(lesson.title,   lang, category, courseTitle);
        const summary = await this.translateText(lesson.summary, lang, category, courseTitle);
        const detail  = await this.translateText(lesson.detail,  lang, category, courseTitle);

        await this.prisma.lesson.update({
          where: { id: lesson.id },
          data: { [titleField]: title, [summaryField]: summary, [detailField]: detail },
        });

        translated++;
        this.logger.log(`[${lang}][${category}] ${lesson.title}`);
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

  startAutoTranslate(lang: 'qu' | 'ay' | 'shp'): { status: string; lang: string } {
    this.logger.log(`[AUTO] Iniciando traducción automática completa para: ${lang}`);
    setImmediate(() => this.runAutoLoop(lang));
    return { status: 'started', lang };
  }

  private async runAutoLoop(lang: 'qu' | 'ay' | 'shp') {
    const suffix     = lang.charAt(0).toUpperCase() + lang.slice(1);
    const titleField = `title${suffix}` as any;
    let totalTranslated = 0;
    let totalErrors = 0;
    let batch = 0;

    while (true) {
      batch++;
      try {
        const result = await this.translateAll(lang, 3);
        totalTranslated += result.translated;
        totalErrors     += result.errors;
        this.logger.log(
          `[AUTO][${lang}] batch ${batch} — +${result.translated} | total: ${totalTranslated} | restantes: ${result.remaining}`,
        );
        if (result.remaining === 0) {
          this.logger.log(`[AUTO][${lang}] ✅ COMPLETADO — ${totalTranslated} lecciones, ${totalErrors} errores`);
          break;
        }
        // pausa entre batches para respetar rate limits
        await new Promise(r => setTimeout(r, 3000));
      } catch (err) {
        this.logger.error(`[AUTO][${lang}] error en batch ${batch}: ${err}`);
        await new Promise(r => setTimeout(r, 15_000));
      }
    }
  }

  private async translateCourses(lang: 'qu' | 'ay' | 'shp') {
    const suffix     = lang.charAt(0).toUpperCase() + lang.slice(1);
    const titleField = `title${suffix}` as any;
    const shortField = `short${suffix}` as any;

    const courses = await this.prisma.course.findMany({
      where: { deletedAt: null, [titleField]: null },
      select: { id: true, title: true, short: true, category: true },
    });

    for (const course of courses) {
      try {
        const [title, short] = await Promise.all([
          this.translateText(course.title, lang, course.category, course.title),
          this.translateText(course.short, lang, course.category, course.title),
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
