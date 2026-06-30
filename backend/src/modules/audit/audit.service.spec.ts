import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      auditLog: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  describe('findAll', () => {
    it('aplica filtros opcionales de usuario y recurso', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(0);

      await service.findAll(1, 50, 'u1', 'auth');

      const where = prisma.auditLog.findMany.mock.calls[0][0].where;
      expect(where).toEqual({ userId: 'u1', resource: 'auth' });
    });

    it('calcula totalPages a partir del total', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(120);

      const result = await service.findAll(1, 50);

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('log', () => {
    it('crea un registro de auditoría', async () => {
      prisma.auditLog.create.mockResolvedValue({ id: 'a1' });
      await service.log({ action: 'LOGIN', resource: 'auth' });
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: { action: 'LOGIN', resource: 'auth' },
      });
    });
  });
});
