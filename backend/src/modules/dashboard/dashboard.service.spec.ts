import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { count: jest.fn(), findMany: jest.fn() },
      course: { count: jest.fn(), findMany: jest.fn() },
      forumThread: { count: jest.fn() },
      forumReply: { count: jest.fn() },
      courseProgress: { count: jest.fn(), findMany: jest.fn(), groupBy: jest.fn() },
      notification: { findMany: jest.fn() },
      quizSubmission: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getAdminStats', () => {
    it('agrupa los totales de la plataforma', async () => {
      prisma.user.count.mockResolvedValue(100);
      prisma.course.count.mockResolvedValue(8);
      prisma.forumThread.count.mockResolvedValue(20);
      prisma.forumReply.count.mockResolvedValue(50);
      prisma.courseProgress.count.mockResolvedValue(40);
      prisma.course.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);
      prisma.courseProgress.groupBy.mockResolvedValue([]);

      const result = await service.getAdminStats();

      expect(result.totals.totalUsers).toBe(100);
      expect(result.totals.totalCourses).toBe(8);
      expect(result).toHaveProperty('courseStats');
      expect(result).toHaveProperty('recentRegistrations');
    });
  });

  describe('getStudentDashboard', () => {
    it('calcula precisión de quizzes y cursos completados', async () => {
      prisma.courseProgress.findMany.mockResolvedValue([
        { lessonsDone: 5, lessonsTotal: 5 },
        { lessonsDone: 1, lessonsTotal: 4 },
      ]);
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.quizSubmission.findMany.mockResolvedValue([
        { isCorrect: true }, { isCorrect: false }, { isCorrect: true }, { isCorrect: true },
      ]);

      const result = await service.getStudentDashboard('u1');

      expect(result.stats.coursesStarted).toBe(2);
      expect(result.stats.coursesCompleted).toBe(1);
      expect(result.stats.totalLessonsDone).toBe(6);
      expect(result.stats.quizAccuracy).toBe(75);
    });
  });
});
