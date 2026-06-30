import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('getUserNotifications', () => {
    it('incluye el conteo de no leídas en la metadata', async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3); // unread

      const result = await service.getUserNotifications('u1', 1, 20);

      expect(result.meta.total).toBe(10);
      expect(result.meta.unreadCount).toBe(3);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('solo marca la notificación del propio usuario', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });
      await service.markAsRead('u1', 'n1');
      const where = prisma.notification.updateMany.mock.calls[0][0].where;
      expect(where).toEqual({ id: 'n1', userId: 'u1' });
    });
  });

  describe('getUnreadCount', () => {
    it('devuelve el número de notificaciones sin leer', async () => {
      prisma.notification.count.mockResolvedValue(7);
      const result = await service.getUnreadCount('u1');
      expect(result).toEqual({ count: 7 });
    });
  });
});
