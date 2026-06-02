import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, published = true) {
    const where: any = { deletedAt: null };
    if (published) where.isPublished = true;
    if (category) where.category = category.toUpperCase();

    return this.prisma.course.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { lessons: { where: { deletedAt: null } }, forumThreads: { where: { deletedAt: null } } } },
      },
    });
  }

  async findOne(slugOrId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        deletedAt: null,
        isPublished: true,
      },
      include: {
        lessons: {
          where: { deletedAt: null },
          orderBy: { index: 'asc' },
          include: {
            quizQuestions: { orderBy: { order: 'asc' } },
          },
        },
        _count: { select: { forumThreads: true } },
      },
    });

    if (!course) throw new NotFoundException('Curso no encontrado');
    return course;
  }

  async create(dto: CreateCourseDto) {
    return this.prisma.course.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findFirst({ where: { id, deletedAt: null } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return this.prisma.course.update({ where: { id }, data: dto as any });
  }

  async softDelete(id: string) {
    const course = await this.prisma.course.findFirst({ where: { id, deletedAt: null } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    await this.prisma.course.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Curso eliminado correctamente' };
  }

  async getCoursesWithProgress(userId: string) {
    const [courses, progress] = await Promise.all([
      this.findAll(),
      this.prisma.courseProgress.findMany({ where: { userId } }),
    ]);

    return courses.map((course) => {
      const p = progress.find((pr) => pr.courseId === course.id);
      return {
        ...course,
        progress: p
          ? {
              lessonsDone: p.lessonsDone,
              lessonsTotal: p.lessonsTotal,
              dailyGoal: p.dailyGoal,
              percentage: p.lessonsTotal > 0 ? Math.round((p.lessonsDone / p.lessonsTotal) * 100) : 0,
              lastActivityAt: p.lastActivityAt,
            }
          : null,
      };
    });
  }
}
