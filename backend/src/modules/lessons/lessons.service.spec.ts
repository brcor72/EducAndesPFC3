import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LessonsService', () => {
  let service: LessonsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      course: { findFirst: jest.fn() },
      lesson: { findMany: jest.fn(), findFirst: jest.fn() },
      quizQuestion: { findUnique: jest.fn() },
      quizSubmission: { create: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  describe('findByCourse', () => {
    it('lanza NotFoundException si el curso no existe', async () => {
      prisma.course.findFirst.mockResolvedValue(null);
      await expect(service.findByCourse('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitQuiz', () => {
    it('marca como correcta la respuesta acertada y la guarda', async () => {
      prisma.quizQuestion.findUnique.mockResolvedValue({ id: 'q1', answer: 2 });
      prisma.quizSubmission.create.mockResolvedValue({});

      const result = await service.submitQuiz('u1', 'q1', 2);

      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswer).toBe(2);
      expect(prisma.quizSubmission.create).toHaveBeenCalled();
    });

    it('marca como incorrecta una respuesta equivocada', async () => {
      prisma.quizQuestion.findUnique.mockResolvedValue({ id: 'q1', answer: 2 });
      prisma.quizSubmission.create.mockResolvedValue({});

      const result = await service.submitQuiz('u1', 'q1', 0);

      expect(result.isCorrect).toBe(false);
    });

    it('lanza NotFoundException si la pregunta no existe', async () => {
      prisma.quizQuestion.findUnique.mockResolvedValue(null);
      await expect(service.submitQuiz('u1', 'qX', 1)).rejects.toThrow(NotFoundException);
    });
  });
});
