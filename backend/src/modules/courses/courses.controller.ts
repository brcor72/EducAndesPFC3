import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar cursos publicados' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'qu', 'ay', 'shp'] })
  findAll(
    @Query('category') category?: string,
    @Query('lang') lang?: string,
    @CurrentUser() user?: any,
  ) {
    const resolvedLang = lang ?? user?.preferredLang ?? 'es';
    return this.coursesService.findAll(category, true, resolvedLang);
  }

  @Get('with-progress')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cursos con progreso del usuario autenticado' })
  getWithProgress(@CurrentUser() user: any) {
    return this.coursesService.getCoursesWithProgress(user.id, user.preferredLang ?? 'es');
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Obtener curso por slug o ID' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'qu', 'ay', 'shp'] })
  findOne(
    @Param('slug') slug: string,
    @Query('lang') lang?: string,
    @CurrentUser() user?: any,
  ) {
    const resolvedLang = lang ?? user?.preferredLang ?? 'es';
    return this.coursesService.findOne(slug, resolvedLang);
  }

  @Post()
  @Roles('admin', 'docente')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin/Docente] Crear curso' })
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'docente')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin/Docente] Actualizar curso' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Eliminar curso' })
  remove(@Param('id') id: string) {
    return this.coursesService.softDelete(id);
  }
}
