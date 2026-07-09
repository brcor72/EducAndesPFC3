import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('lessons')
@Controller('courses/:courseId/lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar lecciones de un curso' })
  findAll(
    @Param('courseId') courseId: string,
    @Query('lang') lang?: string,
    @CurrentUser() user?: any,
  ) {
    return this.lessonsService.findByCourse(courseId, lang ?? user?.preferredLang ?? 'es');
  }

  @Get(':index')
  @Public()
  @ApiOperation({ summary: 'Obtener lección por índice' })
  findOne(
    @Param('courseId') courseId: string,
    @Param('index', ParseIntPipe) index: number,
    @Query('lang') lang?: string,
    @CurrentUser() user?: any,
  ) {
    return this.lessonsService.findOne(courseId, index, lang ?? user?.preferredLang ?? 'es');
  }

  @Post(':lessonId/quiz/submit')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Enviar respuesta de quiz' })
  submitQuiz(
    @Param('lessonId') lessonId: string,
    @Body() body: { questionId: string; selectedAnswer: number },
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.submitQuiz(userId, body.questionId, body.selectedAnswer);
  }

  @Get(':lessonId/quiz/results')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener resultados de quiz del usuario' })
  getResults(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.getUserQuizResults(userId, lessonId);
  }
}
