import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      role: { findUnique: jest.fn() },
      notification: { create: jest.fn() },
      refreshToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
      auditLog: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('jwt-token') } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(7) } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('rechaza un DNI ya registrado', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        service.register({ dni: '12345678', displayName: 'Ana', password: 'pass1234' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('crea el usuario y NO devuelve el passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'estudiante' });
      prisma.user.create.mockResolvedValue({
        id: 'u1', dni: '12345678', displayName: 'Ana',
        passwordHash: 'hashed', role: { name: 'estudiante' },
      });
      prisma.notification.create.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        dni: '12345678', displayName: 'Ana', password: 'pass1234',
      } as any);

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.accessToken).toBe('jwt-token');
    });
  });

  describe('login', () => {
    it('rechaza credenciales inválidas (contraseña incorrecta)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1', isActive: true, deletedAt: null, passwordHash: 'hashed', role: { name: 'estudiante' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ dni: '12345678', password: 'mala' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('inicia sesión y registra el evento de auditoría', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1', dni: '12345678', isActive: true, deletedAt: null,
        passwordHash: 'hashed', role: { name: 'estudiante' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.refreshToken.create.mockResolvedValue({});
      prisma.auditLog.create.mockResolvedValue({});

      const result = await service.login({ dni: '12345678', password: 'pass1234' } as any);

      expect(result.accessToken).toBe('jwt-token');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
