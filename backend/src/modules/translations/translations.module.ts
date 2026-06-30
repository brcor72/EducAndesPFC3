import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [TranslationsController],
  providers: [TranslationsService],
})
export class TranslationsModule {}
