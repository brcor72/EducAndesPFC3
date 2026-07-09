import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      courseProgress: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      course: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  describe('getUserProgress', () => {
    it('calcula el porcentaje general y los totales', async () => {
      prisma.courseProgress.findMany.mockResolvedValue([
        { lessonsDone: 4, lessonsTotal: 8, course: {} },
        { lessonsDone: 6, lessonsTotal: 6, course: {} },
      ]);

      const result = await service.getUserProgress('u1');

      expect(result.totals.done).toBe(10);
      expect(result.totals.total).toBe(14);
      expect(result.totals.completed).toBe(1);
      expect(result.overallPct).toBe(71);
    });
  });

  describe('upsertProgress', () => {
    it('limita lessonsDone al total del curso (no permite pasarse)', async () => {
      prisma.course.findFirst.mockResolvedValue({ id: 'c1', _count: { lessons: 5 } });
      prisma.courseProgress.findUnique.mockResolvedValue(null);
      prisma.courseProgress.create.mockResolvedValue({});

      await service.upsertProgress('u1', 'c1', 99);

      const data = prisma.courseProgress.create.mock.calls[0][0].data;
      expect(data.lessonsDone).toBe(5);
    });

    it('actualiza si ya existe un registro de progreso', async () => {
      prisma.course.findFirst.mockResolvedValue({ id: 'c1', _count: { lessons: 10 } });
      prisma.courseProgress.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.courseProgress.update.mockResolvedValue({});

      await service.upsertProgress('u1', 'c1', 3);

      expect(prisma.courseProgress.update).toHaveBeenCalled();
      expect(prisma.courseProgress.create).not.toHaveBeenCalled();
    });
  });
});
