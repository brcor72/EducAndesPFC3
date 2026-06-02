import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { dni: dto.dni } });
    if (existing) throw new ConflictException('Este DNI ya tiene una cuenta registrada');

    const studentRole = await this.prisma.role.findUnique({ where: { name: 'estudiante' } });
    if (!studentRole) throw new BadRequestException('Rol de estudiante no configurado');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        dni: dto.dni,
        displayName: dto.displayName,
        community: dto.community || null,
        preferredLang: (dto.preferredLang || 'es') as any,
        passwordHash,
        roleId: studentRole.id,
      },
      include: { role: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: user.id,
        title: '¡Bienvenida/o a Allin Yachay!',
        message: `Hola ${user.displayName}, tu cuenta ha sido creada exitosamente. ¡Comienza explorando nuestros cursos!`,
        type: 'SYSTEM',
      },
    });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { dni: dto.dni },
      include: { role: true },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('DNI o contraseña incorrectos');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('DNI o contraseña incorrectos');

    const tokens = await this.generateTokens(user, ipAddress, userAgent);

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'auth',
        ipAddress,
        userAgent,
      },
    });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      include: { role: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Usuario no válido');

    return this.generateTokens(user);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: any, ipAddress?: string, userAgent?: string) {
    const payload = { sub: user.id, dni: user.dni, role: user.role.name };

    const accessToken = this.jwtService.sign(payload);

    const refreshTokenValue = uuidv4();
    const refreshExpiresIn = this.configService.get<number>('REFRESH_TOKEN_EXPIRES_DAYS', 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshExpiresIn * 24 * 60 * 60 * 1000),
        ipAddress,
        userAgent,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
