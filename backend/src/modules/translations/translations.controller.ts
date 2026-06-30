import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TranslationsService } from './translations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('translations')
@Controller('translations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class TranslationsController {
  constructor(private readonly svc: TranslationsService) {}

  @Get('status')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Estado de traducciones por idioma' })
  getStatus() {
    return this.svc.getStatus();
  }

  @Post('translate-all/:lang')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Traducir todas las lecciones al idioma indicado (qu|ay|shp)' })
  translateAll(@Param('lang') lang: 'qu' | 'ay' | 'shp') {
    return this.svc.translateAll(lang);
  }
}
