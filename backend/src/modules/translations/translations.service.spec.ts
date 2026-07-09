import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TranslationsService } from './translations.service';
import { PrismaService } from '../../prisma/prisma.service';

// Evita que el SDK de OpenAI exija credenciales reales al construirse.
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn() } },
  })),
}));

describe('TranslationsService', () => {
  let service: TranslationsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      lesson: { count: jest.fn(), updateMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('') } },
      ],
    }).compile();

    service = module.get<TranslationsService>(TranslationsService);
  });

  describe('getStatus', () => {
    it('calcula lecciones pendientes por idioma', async () => {
      prisma.lesson.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4)  // qu
        .mockResolvedValueOnce(2)  // ay
        .mockResolvedValueOnce(0); // shp

      const result = await service.getStatus();

      expect(result.totalLessons).toBe(10);
      expect(result.pendingQu).toBe(6);
      expect(result.pendingAy).toBe(8);
      expect(result.pendingShp).toBe(10);
    });
  });

  describe('clearTranslations', () => {
    it('limpia los campos del idioma indicado', async () => {
      prisma.lesson.updateMany.mockResolvedValue({ count: 5 });
      const result = await service.clearTranslations('qu');
      expect(result).toEqual({ cleared: 'qu' });
      expect(prisma.lesson.updateMany).toHaveBeenCalled();
    });
  });
});
