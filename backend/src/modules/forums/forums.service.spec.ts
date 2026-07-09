import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ForumsService', () => {
  let service: ForumsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      course: { findFirst: jest.fn() },
      forumThread: {
        findMany: jest.fn(), count: jest.fn(), create: jest.fn(),
        findFirst: jest.fn(), update: jest.fn(),
      },
      forumReply: { findMany: jest.fn(), create: jest.fn() },
      notification: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ForumsService>(ForumsService);
  });

  describe('createThread', () => {
    it('lanza NotFoundException si el curso no existe', async () => {
      prisma.course.findFirst.mockResolvedValue(null);
      await expect(
        service.createThread('u1', 'cX', 'Título', 'Cuerpo'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createReply', () => {
    it('notifica al autor del hilo cuando responde otra persona', async () => {
      prisma.forumThread.findFirst.mockResolvedValue({ id: 't1', authorId: 'autor', title: 'Hola' });
      prisma.forumReply.create.mockResolvedValue({ id: 'r1' });
      prisma.notification.create.mockResolvedValue({});

      await service.createReply('otro', 't1', 'Mi respuesta');

      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('NO se notifica a sí mismo cuando el autor responde su propio hilo', async () => {
      prisma.forumThread.findFirst.mockResolvedValue({ id: 't1', authorId: 'u1', title: 'Hola' });
      prisma.forumReply.create.mockResolvedValue({ id: 'r1' });

      await service.createReply('u1', 't1', 'Mi respuesta');

      expect(prisma.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteThread', () => {
    it('impide borrar el hilo de otro si no eres admin', async () => {
      prisma.forumThread.findFirst.mockResolvedValue({ id: 't1', authorId: 'autor' });
      await expect(
        service.deleteThread('t1', 'otro', 'estudiante'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
