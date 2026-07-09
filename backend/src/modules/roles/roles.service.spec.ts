import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: {
    role: { findMany: jest.Mock; findUnique: jest.Mock };
    user: { update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      role: { findMany: jest.fn(), findUnique: jest.fn() },
      user: { update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('devuelve todos los roles con sus permisos anidados', async () => {
      const roles = [{ id: '1', name: 'ADMIN', permissions: [] }];
      prisma.role.findMany.mockResolvedValue(roles);

      const result = await service.findAll();

      expect(result).toEqual(roles);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        include: { permissions: { include: { permission: true } } },
      });
    });
  });

  describe('assignRoleToUser', () => {
    it('asigna el rol al usuario cuando el rol existe', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'DOCENTE' });
      prisma.user.update.mockResolvedValue({ id: 'u1', roleId: 'r1' });

      const result = await service.assignRoleToUser('u1', 'DOCENTE');

      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'DOCENTE' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { roleId: 'r1' },
      });
      expect(result).toEqual({ id: 'u1', roleId: 'r1' });
    });

    it('lanza NotFoundException y no actualiza si el rol no existe', async () => {
      prisma.role.findUnique.mockResolvedValue(null);

      await expect(
        service.assignRoleToUser('u1', 'NO_EXISTE'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
