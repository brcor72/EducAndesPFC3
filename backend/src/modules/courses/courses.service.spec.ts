import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      course: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      courseProgress: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  describe('findAll', () => {
    it('filtra por categoría en mayúsculas y solo publicados', async () => {
      prisma.course.findMany.mockResolvedValue([]);
      await service.findAll('campo', true, 'es');
      const arg = prisma.course.findMany.mock.calls[0][0];
      expect(arg.where.category).toBe('CAMPO');
      expect(arg.where.isPublished).toBe(true);
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException cuando el curso no existe', async () => {
      prisma.course.findFirst.mockResolvedValue(null);
      await expect(service.findOne('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('marca deletedAt en lugar de borrar físicamente', async () => {
      prisma.course.findFirst.mockResolvedValue({ id: 'c1' });
      prisma.course.update.mockResolvedValue({});
      await service.softDelete('c1');
      const arg = prisma.course.update.mock.calls[0][0];
      expect(arg.data.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('getCoursesWithProgress', () => {
    it('calcula el porcentaje de avance por curso', async () => {
      prisma.course.findMany.mockResolvedValue([{ id: 'c1', title: 'Ganadería' }]);
      prisma.courseProgress.findMany.mockResolvedValue([
        { courseId: 'c1', lessonsDone: 3, lessonsTotal: 6, dailyGoal: 1, lastActivityAt: null },
      ]);
      const result = await service.getCoursesWithProgress('u1', 'es');
      expect(result[0].progress.percentage).toBe(50);
    });
  });
});
