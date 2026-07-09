import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token UUID' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
