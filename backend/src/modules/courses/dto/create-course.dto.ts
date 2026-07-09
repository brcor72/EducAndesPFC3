import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'ganaderia' })
  @IsString() @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Ganadería inteligente' })
  @IsString() @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  titleQu?: string;

  @ApiProperty({ example: 'Registra llamas y alpacas en tu celular...' })
  @IsString() @IsNotEmpty()
  short: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  long: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  iconName?: string;

  @ApiProperty({ enum: ['INICIAL', 'INTERMEDIO', 'AVANZADO'] })
  @IsEnum(['INICIAL', 'INTERMEDIO', 'AVANZADO'])
  level: 'INICIAL' | 'INTERMEDIO' | 'AVANZADO';

  @ApiProperty({ example: 4 })
  @IsInt() @Min(1) @Max(52)
  durationWeeks: number;

  @ApiProperty({ enum: ['CAMPO', 'NEGOCIO', 'TECNOLOGIA', 'ENERGIA'] })
  @IsEnum(['CAMPO', 'NEGOCIO', 'TECNOLOGIA', 'ENERGIA'])
  category: 'CAMPO' | 'NEGOCIO' | 'TECNOLOGIA' | 'ENERGIA';

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt()
  sortOrder?: number;
}
