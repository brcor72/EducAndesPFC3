import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService, ChatMessageDto } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('practice')
  @ApiOperation({ summary: 'Enviar mensaje en una sesión de práctica interactiva' })
  async runPractice(
    @Body() body: { lessonId: string; history: ChatMessageDto[] },
    @CurrentUser('preferredLang') preferredLang: string,
  ) {
    return this.aiService.runPracticeSession(
      body.lessonId,
      body.history,
      preferredLang || 'es',
    );
  }
}
