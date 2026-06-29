import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const EMBED_DIMS = 768;
// Llamada directa a v1 (estable) en lugar del SDK que usa v1beta
const EMBED_URL = 'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent';

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private apiKey = '';
  private enabled = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('GOOGLE_AI_API_KEY') ?? '';
    if (this.apiKey) {
      this.enabled = true;
    } else {
      this.logger.warn('GOOGLE_AI_API_KEY no configurada — RAG desactivado');
    }
  }

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`);
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS lesson_embeddings (
          id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          lesson_id   TEXT NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
          content     TEXT NOT NULL,
          embedding   vector(${EMBED_DIMS}),
          created_at  TIMESTAMPTZ DEFAULT NOW(),
          updated_at  TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      this.logger.log('Tabla lesson_embeddings lista');
    } catch (err: any) {
      this.logger.error('Error inicializando RAG: ' + err?.message);
    }
  }

  /** Llama directamente a la API REST v1 de Google (evita el SDK que usa v1beta) */
  async embedText(text: string): Promise<number[]> {
    if (!this.enabled) throw new Error('RAG no habilitado: falta GOOGLE_AI_API_KEY');

    const res = await fetch(`${EMBED_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] } }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Embedding API error ${res.status}: ${err}`);
    }

    const json: any = await res.json();
    return json.embedding.values as number[];
  }

  async indexAllLessons(): Promise<{ indexed: number; errors: number }> {
    if (!this.enabled) return { indexed: 0, errors: 0 };

    const lessons = await this.prisma.lesson.findMany({
      where: { deletedAt: null },
      include: { course: { select: { title: true, category: true } } },
    });

    let indexed = 0;
    let errors = 0;

    for (const lesson of lessons) {
      try {
        const content = [
          `Curso: ${lesson.course.title}`,
          `Categoría: ${lesson.course.category}`,
          `Lección ${lesson.index}: ${lesson.title}`,
          `Resumen: ${lesson.summary}`,
          lesson.detail,
          lesson.practiceScenario ? `Práctica: ${lesson.practiceScenario}` : '',
          lesson.practiceHint    ? `Pista: ${lesson.practiceHint}` : '',
        ].filter(Boolean).join('\n');

        const embedding = await this.embedText(content);
        const vectorStr = `[${embedding.join(',')}]`;

        await this.prisma.$executeRawUnsafe(
          `INSERT INTO lesson_embeddings (lesson_id, content, embedding)
           VALUES ($1, $2, $3::vector)
           ON CONFLICT (lesson_id) DO UPDATE
             SET content    = EXCLUDED.content,
                 embedding  = EXCLUDED.embedding,
                 updated_at = NOW()`,
          lesson.id,
          content,
          vectorStr,
        );

        indexed++;
        this.logger.log(`Indexado ${indexed}/${lessons.length}: ${lesson.title}`);
        await new Promise((r) => setTimeout(r, 150));
      } catch (err: any) {
        errors++;
        this.logger.error(`Error indexando lección ${lesson.id}: ${err?.message}`);
      }
    }

    return { indexed, errors };
  }

  async searchSimilar(
    query: string,
    limit = 3,
  ): Promise<Array<{ lessonId: string; content: string; distance: number }>> {
    if (!this.enabled) return [];

    try {
      const embedding = await this.embedText(query);
      const vectorStr = `[${embedding.join(',')}]`;

      const rows = await this.prisma.$queryRawUnsafe<
        Array<{ lesson_id: string; content: string; distance: number }>
      >(
        `SELECT lesson_id, content,
                embedding <=> $1::vector AS distance
         FROM   lesson_embeddings
         ORDER  BY distance ASC
         LIMIT  $2`,
        vectorStr,
        limit,
      );

      return rows.map((r) => ({
        lessonId: r.lesson_id,
        content:  r.content,
        distance: Number(r.distance),
      }));
    } catch (err: any) {
      this.logger.error('Error en búsqueda RAG: ' + err?.message);
      return [];
    }
  }

  async indexedCount(): Promise<number> {
    try {
      const result = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) AS count FROM lesson_embeddings`,
      );
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }
}
