import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string, roleFilter?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } },
        { community: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (roleFilter) {
      where.role = { name: roleFilter };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(({ passwordHash, ...u }) => u),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user || user.deletedAt) throw new NotFoundException('Usuario no encontrado');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: string) {
    if (requesterId !== id && requesterRole !== 'admin') {
      throw new ForbiddenException('Solo puedes editar tu propio perfil');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) throw new NotFoundException('Usuario no encontrado');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        displayName: dto.displayName,
        community: dto.community,
        preferredLang: dto.preferredLang,
        avatarUrl: dto.avatarUrl,
        gender: dto.gender,
        skinTone: dto.skinTone,
        birthYear: dto.birthYear,
        activity: dto.activity,
      },
      include: { role: true },
    });

    const { passwordHash, ...safe } = updated;
    return safe;
  }

  async softDelete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { message: 'Usuario desactivado correctamente' };
  }

  async getUserStats(id: string) {
    const [progressRows, threadsCount, repliesCount] = await Promise.all([
      this.prisma.courseProgress.findMany({ where: { userId: id } }),
      this.prisma.forumThread.count({ where: { authorId: id, deletedAt: null } }),
      this.prisma.forumReply.count({ where: { authorId: id, deletedAt: null } }),
    ]);

    const completedCourses = progressRows.filter(
      (r) => r.lessonsDone >= r.lessonsTotal && r.lessonsTotal > 0,
    ).length;

    const totalLessonsDone = progressRows.reduce((s, r) => s + r.lessonsDone, 0);

    return { completedCourses, totalLessonsDone, threadsCount, repliesCount };
  }
}
