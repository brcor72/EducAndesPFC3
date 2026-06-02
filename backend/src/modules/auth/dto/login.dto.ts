import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener 8 dígitos' })
  dni: string;

  @ApiProperty({ example: 'chacra2025' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
