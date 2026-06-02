import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';
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
}
