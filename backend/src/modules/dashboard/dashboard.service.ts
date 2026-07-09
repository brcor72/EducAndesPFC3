import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalForumThreads,
      totalForumReplies,
      activeUsersToday,
      coursesCompletions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, role: { name: 'estudiante' } } }),
      this.prisma.user.count({ where: { deletedAt: null, role: { name: 'docente' } } }),
      this.prisma.course.count({ where: { deletedAt: null, isPublished: true } }),
      this.prisma.forumThread.count({ where: { deletedAt: null } }),
      this.prisma.forumReply.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
          progress: {
            some: {
              lastActivityAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
          },
        },
      }),
      this.prisma.courseProgress.count({
        where: { lessonsDone: { gt: 0 } },
      }),
    ]);

    const courseStats = await this.prisma.course.findMany({
      where: { deletedAt: null, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: { select: { progress: true, forumThreads: { where: { deletedAt: null } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const recentRegistrations = await this.prisma.user.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, displayName: true, community: true, createdAt: true,
        role: { select: { name: true } },
      },
    });

    const progressByCategory = await this.prisma.courseProgress.groupBy({
      by: ['courseId'],
      _avg: { lessonsDone: true, lessonsTotal: true },
      _count: { userId: true },
    });

    return {
      totals: { totalUsers, totalStudents, totalTeachers, totalCourses, totalForumThreads, totalForumReplies, activeUsersToday, coursesCompletions },
      courseStats,
      recentRegistrations,
      progressByCategory,
    };
  }

  async getStudentDashboard(userId: string) {
    const [progress, notifications, recentActivity] = await Promise.all([
      this.prisma.courseProgress.findMany({
        where: { userId },
        include: { course: { select: { slug: true, title: true, category: true, imageUrl: true, iconName: true } } },
        orderBy: { lastActivityAt: 'desc' },
      }),
      this.prisma.notification.findMany({
        where: { userId, isRead: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quizSubmission.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { question: { include: { lesson: { select: { title: true, courseId: true } } } } },
      }),
    ]);

    const completed = progress.filter((p) => p.lessonsDone >= p.lessonsTotal && p.lessonsTotal > 0);
    const totalDone = progress.reduce((s, p) => s + p.lessonsDone, 0);
    const correctAnswers = recentActivity.filter((s) => s.isCorrect).length;

    return {
      progress,
      stats: {
        coursesStarted: progress.length,
        coursesCompleted: completed.length,
        totalLessonsDone: totalDone,
        quizAccuracy: recentActivity.length > 0 ? Math.round((correctAnswers / recentActivity.length) * 100) : 0,
      },
      notifications,
    };
  }
}
