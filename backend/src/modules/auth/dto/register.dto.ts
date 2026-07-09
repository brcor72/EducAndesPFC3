import { IsString, IsNotEmpty, Matches, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '12345678', description: 'DNI de 8 dígitos' })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos' })
  dni: string;

  @ApiProperty({ example: 'María Quispe', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional({ example: 'Puno', description: 'Comunidad o distrito' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  community?: string;

  @ApiProperty({ example: 'chacra2025', description: 'Contraseña (min 8 chars, 1 letra, 1 número)' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  @Matches(/[A-Za-zÀ-ÿñÑ]/, { message: 'La contraseña debe incluir al menos una letra' })
  @Matches(/[0-9]/, { message: 'La contraseña debe incluir al menos un número' })
  password: string;

  @ApiPropertyOptional({ example: 'es', enum: ['es', 'qu', 'ay', 'shp'] })
  @IsOptional()
  @IsIn(['es', 'qu', 'ay', 'shp'])
  preferredLang?: string;
}
