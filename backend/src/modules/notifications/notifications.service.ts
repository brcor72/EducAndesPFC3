import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return {
      data: notifications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }
}
