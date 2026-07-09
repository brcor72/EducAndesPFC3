import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener progreso del usuario autenticado' })
  getMyProgress(@CurrentUser('id') userId: string) {
    return this.progressService.getUserProgress(userId);
  }

  @Post(':courseId')
  @ApiOperation({ summary: 'Actualizar progreso en un curso' })
  upsert(
    @Param('courseId') courseId: string,
    @Body() body: { lessonsDone: number; dailyGoal?: number },
    @CurrentUser('id') userId: string,
  ) {
    return this.progressService.upsertProgress(userId, courseId, body.lessonsDone, body.dailyGoal);
  }
}
