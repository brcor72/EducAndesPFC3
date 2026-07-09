import { Controller, Post, Get, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('rag')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('index')
  @HttpCode(200)
  @ApiOperation({ summary: 'Indexa todas las lecciones con embeddings (ejecutar una vez)' })
  async indexAll() {
    const result = await this.ragService.indexAllLessons();
    return {
      message: `Indexación completada: ${result.indexed} lecciones indexadas, ${result.errors} errores`,
      ...result,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Devuelve cuántas lecciones están indexadas en la base vectorial' })
  async status() {
    const count = await this.ragService.indexedCount();
    return { indexedLessons: count };
  }
}
