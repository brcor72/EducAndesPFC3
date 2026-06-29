import { IsOptional, IsString, MaxLength, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'María Quispe' })
  @IsOptional() @IsString() @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ example: 'Puno' })
  @IsOptional() @IsString() @MaxLength(100)
  community?: string;

  @ApiPropertyOptional({ enum: ['es', 'qu', 'ay', 'shp'] })
  @IsOptional() @IsIn(['es', 'qu', 'ay', 'shp'])
  preferredLang?: any;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: ['masculino', 'femenino', 'no_especificado'] })
  @IsOptional() @IsIn(['masculino', 'femenino', 'no_especificado'])
  gender?: string;

  @ApiPropertyOptional({ enum: ['claro', 'medio', 'moreno', 'oscuro'] })
  @IsOptional() @IsIn(['claro', 'medio', 'moreno', 'oscuro'])
  skinTone?: string;

  @ApiPropertyOptional({ example: 1995 })
  @IsOptional() @IsInt() @Min(1940) @Max(2015)
  birthYear?: number;

  @ApiPropertyOptional({ enum: ['agricultor', 'tejedora', 'ganadero', 'pastor', 'artesana', 'comerciante', 'docente', 'estudiante'] })
  @IsOptional() @IsIn(['agricultor', 'tejedora', 'ganadero', 'pastor', 'artesana', 'comerciante', 'docente', 'estudiante'])
  activity?: string;
}
