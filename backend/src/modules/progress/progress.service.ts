import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getUserProgress(userId: string) {
    const rows = await this.prisma.courseProgress.findMany({
      where: { userId },
      include: { course: { select: { slug: true, title: true, category: true, level: true } } },
      orderBy: { lastActivityAt: 'desc' },
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.done += r.lessonsDone;
        acc.total += r.lessonsTotal;
        if (r.lessonsDone >= r.lessonsTotal && r.lessonsTotal > 0) acc.completed += 1;
        return acc;
      },
      { done: 0, total: 0, completed: 0 },
    );

    const overallPct = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;

    return { rows, totals, overallPct };
  }

  async upsertProgress(userId: string, courseId: string, lessonsDone: number, dailyGoal?: number) {
    const course = await this.prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      include: { _count: { select: { lessons: { where: { deletedAt: null } } } } },
    });

    const lessonsTotal = course?._count?.lessons ?? 12;
    const safeDone = Math.max(0, Math.min(lessonsTotal, lessonsDone));

    const existing = await this.prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId, courseId: course?.id ?? courseId } },
    });

    const data: any = {
      lessonsDone: safeDone,
      lastActivityAt: new Date(),
    };
    if (dailyGoal !== undefined) {
      data.dailyGoal = Math.max(1, Math.min(5, dailyGoal));
    }

    if (existing) {
      return this.prisma.courseProgress.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return this.prisma.courseProgress.create({
        data: {
          userId,
          courseId: course?.id ?? courseId,
          lessonsTotal,
          ...data,
          dailyGoal: dailyGoal ?? 1,
        },
      });
    }
  }

  async updateDailyGoal(userId: string, courseId: string, dailyGoal: number) {
    return this.upsertProgress(userId, courseId, 0, dailyGoal);
  }
}
