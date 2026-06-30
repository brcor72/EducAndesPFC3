import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      courseProgress: { findMany: jest.fn() },
      forumThread: { count: jest.fn() },
      forumReply: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('pagina y nunca expone el passwordHash', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u1', displayName: 'Ana', passwordHash: 'secreto' },
      ]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result.data[0]).not.toHaveProperty('passwordHash');
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });

    it('devuelve el usuario sin passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1', displayName: 'Ana', deletedAt: null, passwordHash: 'h',
      });
      const result = await service.findOne('u1');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe('u1');
    });
  });

  describe('update', () => {
    it('impide editar el perfil de otro si no eres admin', async () => {
      await expect(
        service.update('u2', {} as any, 'u1', 'estudiante'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('permite a un admin editar a cualquiera', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u2', deletedAt: null });
      prisma.user.update.mockResolvedValue({ id: 'u2', displayName: 'Nuevo', passwordHash: 'h' });

      const result = await service.update('u2', { displayName: 'Nuevo' } as any, 'admin1', 'admin');

      expect(result).not.toHaveProperty('passwordHash');
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('cuenta cursos completados correctamente', async () => {
      prisma.courseProgress.findMany.mockResolvedValue([
        { lessonsDone: 5, lessonsTotal: 5 },
        { lessonsDone: 2, lessonsTotal: 8 },
      ]);
      prisma.forumThread.count.mockResolvedValue(3);
      prisma.forumReply.count.mockResolvedValue(4);

      const stats = await service.getUserStats('u1');

      expect(stats.completedCourses).toBe(1);
      expect(stats.totalLessonsDone).toBe(7);
      expect(stats.threadsCount).toBe(3);
      expect(stats.repliesCount).toBe(4);
    });
  });
});
