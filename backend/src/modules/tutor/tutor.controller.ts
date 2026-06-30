import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { TutorService } from './tutor.service';
import { TutorChatDto } from './tutor.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('tutor')
@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  // Endpoint público que consume cuota del proveedor de IA (Groq):
  // límite estricto para evitar abuso y costos. 10 peticiones por minuto/IP.
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('chat')
  @ApiOperation({ summary: 'Streaming SSE chat con el tutor virtual Yachay' })
  async chat(@Body() dto: TutorChatDto, @Res() res: Response): Promise<void> {
    return this.tutorService.streamChat(dto, res);
  }
}
