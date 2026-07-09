import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ForumsService {
  constructor(private prisma: PrismaService) {}

  async getThreadsByCourse(courseId: string, page = 1, limit = 20) {
    const course = await this.prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }], deletedAt: null },
    });
    if (!course) throw new NotFoundException('Curso no encontrado');

    const skip = (page - 1) * limit;
    const [threads, total] = await Promise.all([
      this.prisma.forumThread.findMany({
        where: { courseId: course.id, deletedAt: null },
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: { select: { displayName: true, community: true, avatarUrl: true } },
          _count: { select: { replies: { where: { deletedAt: null } } } },
        },
      }),
      this.prisma.forumThread.count({ where: { courseId: course.id, deletedAt: null } }),
    ]);

    return { data: threads, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createThread(userId: string, courseId: string, title: string, body: string) {
    const course = await this.prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }], deletedAt: null },
    });
    if (!course) throw new NotFoundException('Curso no encontrado');

    const thread = await this.prisma.forumThread.create({
      data: { courseId: course.id, authorId: userId, title, body },
      include: {
        author: { select: { displayName: true, community: true } },
      },
    });

    return thread;
  }

  async getReplies(threadId: string) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, deletedAt: null },
    });
    if (!thread) throw new NotFoundException('Hilo no encontrado');

    return this.prisma.forumReply.findMany({
      where: { threadId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { displayName: true, community: true, avatarUrl: true } },
      },
    });
  }

  async createReply(userId: string, threadId: string, body: string) {
    const thread = await this.prisma.forumThread.findFirst({
      where: { id: threadId, deletedAt: null },
    });
    if (!thread) throw new NotFoundException('Hilo no encontrado');

    const reply = await this.prisma.forumReply.create({
      data: { threadId, authorId: userId, body },
      include: { author: { select: { displayName: true, community: true } } },
    });

    // Notify thread author
    if (thread.authorId !== userId) {
      await this.prisma.notification.create({
        data: {
          userId: thread.authorId,
          title: 'Nueva respuesta en tu tema',
          message: `Alguien respondió a tu tema: "${thread.title}"`,
          type: 'FORUM_REPLY',
          metadata: { threadId, replyId: reply.id },
        },
      });
    }

    return reply;
  }

  async deleteThread(id: string, userId: string, userRole: string) {
    const thread = await this.prisma.forumThread.findFirst({ where: { id, deletedAt: null } });
    if (!thread) throw new NotFoundException('Hilo no encontrado');
    if (thread.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('No tienes permiso para eliminar este hilo');
    }
    await this.prisma.forumThread.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Hilo eliminado' };
  }
}
