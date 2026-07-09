import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { TutorService } from './tutor.service';
import { TutorChatDto } from './tutor.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('tutor')
@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Streaming SSE chat con el tutor virtual Yachay' })
  async chat(@Body() dto: TutorChatDto, @Res() res: Response): Promise<void> {
    return this.tutorService.streamChat(dto, res);
  }
}
