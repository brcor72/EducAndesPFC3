import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ForumsService } from './forums.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('forums')
@Controller('forums')
@UseGuards(JwtAuthGuard)
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get('courses/:courseId/threads')
  @Public()
  @ApiOperation({ summary: 'Listar hilos de un curso' })
  getThreads(
    @Param('courseId') courseId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.forumsService.getThreadsByCourse(courseId, page, limit);
  }

  @Post('courses/:courseId/threads')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear nuevo hilo en un foro' })
  createThread(
    @Param('courseId') courseId: string,
    @Body() body: { title: string; body: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.forumsService.createThread(userId, courseId, body.title, body.body);
  }

  @Get('threads/:threadId/replies')
  @Public()
  @ApiOperation({ summary: 'Listar respuestas de un hilo' })
  getReplies(@Param('threadId') threadId: string) {
    return this.forumsService.getReplies(threadId);
  }

  @Post('threads/:threadId/replies')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Responder a un hilo' })
  createReply(
    @Param('threadId') threadId: string,
    @Body() body: { body: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.forumsService.createReply(userId, threadId, body.body);
  }

  @Delete('threads/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar hilo (autor o admin)' })
  deleteThread(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.forumsService.deleteThread(id, userId, user.role?.name);
  }
}
