import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      // Tabla de índice léxico con tsvector (RAG sin API externa)
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS lesson_search_index (
          lesson_id   TEXT PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
          content     TEXT NOT NULL,
          search_vec  tsvector NOT NULL,
          created_at  TIMESTAMPTZ DEFAULT NOW(),
          updated_at  TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS lesson_search_index_vec_idx
          ON lesson_search_index USING GIN(search_vec)
      `);
      this.logger.log('Índice léxico RAG listo (tsvector + GIN)');
    } catch (err: any) {
      this.logger.error('Error inicializando RAG: ' + err?.message);
    }
  }

  /** Indexa todas las lecciones activas en el índice léxico */
  async indexAllLessons(): Promise<{ indexed: number; errors: number }> {
    const lessons = await this.prisma.lesson.findMany({
      where: { deletedAt: null },
      include: { course: { select: { title: true, category: true } } },
    });

    let indexed = 0;
    let errors = 0;

    for (const lesson of lessons) {
      try {
        const content = [
          lesson.course.title,
          lesson.course.category,
          lesson.title,
          lesson.summary,
          lesson.detail,
          lesson.practiceScenario ?? '',
          lesson.practiceHint    ?? '',
        ].filter(Boolean).join(' ');

        await this.prisma.$executeRawUnsafe(
          `INSERT INTO lesson_search_index (lesson_id, content, search_vec)
           VALUES ($1, $2, to_tsvector('spanish', $2))
           ON CONFLICT (lesson_id) DO UPDATE
             SET content    = EXCLUDED.content,
                 search_vec = EXCLUDED.search_vec,
                 updated_at = NOW()`,
          lesson.id,
          content,
        );

        indexed++;
        this.logger.log(`Indexado ${indexed}/${lessons.length}: ${lesson.title}`);
      } catch (err: any) {
        errors++;
        this.logger.error(`Error indexando lección ${lesson.id}: ${err?.message}`);
      }
    }

    return { indexed, errors };
  }

  /**
   * Búsqueda léxica RAG: devuelve las lecciones más relevantes para la consulta.
   * Usa ts_rank con tsvector — equivalente a BM25, la misma técnica de Elasticsearch.
   */
  async searchSimilar(
    query: string,
    limit = 3,
  ): Promise<Array<{ lessonId: string; content: string; distance: number }>> {
    try {
      // Sanitizar query: quitar caracteres especiales de tsquery
      const safeQuery = query.replace(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]/g, ' ').trim();
      if (!safeQuery) return [];

      const rows = await this.prisma.$queryRawUnsafe<
        Array<{ lesson_id: string; content: string; rank: number }>
      >(
        `SELECT lesson_id, content,
                ts_rank(search_vec, plainto_tsquery('spanish', $1)) AS rank
         FROM   lesson_search_index
         WHERE  search_vec @@ plainto_tsquery('spanish', $1)
         ORDER  BY rank DESC
         LIMIT  $2`,
        safeQuery,
        limit,
      );

      return rows.map((r) => ({
        lessonId: r.lesson_id,
        content:  r.content,
        distance: 1 - Number(r.rank), // convertir rank a distancia para compatibilidad
      }));
    } catch (err: any) {
      this.logger.error('Error en búsqueda RAG: ' + err?.message);
      return [];
    }
  }

  async indexedCount(): Promise<number> {
    try {
      const result = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) AS count FROM lesson_search_index`,
      );
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }
}
