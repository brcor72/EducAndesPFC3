import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const HF_MODEL = 'black-forest-labs/FLUX.1-schnell';
const HF_URL   = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

const GENDER_DESC: Record<string, string> = {
  masculino:       'man',
  femenino:        'woman',
  no_especificado: 'person',
};
const ACTIVITY_DESC: Record<string, string> = {
  agricultor:  'farmer wearing a green poncho',
  tejedora:    'weaver wearing colorful traditional clothing',
  ganadero:    'cattle herder wearing a brown poncho',
  pastor:      'shepherd wearing a blue poncho',
  artesana:    'artisan wearing a vibrant manta',
  comerciante: 'merchant wearing traditional Andean attire',
  docente:     'teacher wearing a formal shirt with Andean scarf',
  estudiante:  'student wearing casual clothes with Andean details',
};
const SKIN_DESC: Record<string, string> = {
  claro:  'light skin',
  medio:  'medium brown skin',
  moreno: 'dark brown skin',
  oscuro: 'very dark brown skin',
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async generateAvatar(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const hfToken = this.configService.get<string>('HF_TOKEN') ?? '';
    const gender   = GENDER_DESC[user.gender ?? '']   ?? 'person';
    const activity = ACTIVITY_DESC[user.activity ?? ''] ?? 'student';
    const skin     = SKIN_DESC[user.skinTone ?? '']   ?? 'medium brown skin';
    const age      = user.birthYear ? new Date().getFullYear() - user.birthYear : 30;
    const ageDesc  = age < 25 ? 'young' : age > 50 ? 'elderly' : 'adult';

    const prompt = `Portrait of an ${ageDesc} Andean ${gender}, ${activity}, ${skin}, wearing a colorful traditional chullo hat with geometric patterns, warm friendly smile, Andean mountains background, vibrant colors, high quality digital illustration, soft lighting`;

    this.logger.log(`Generando avatar para ${user.displayName}: ${prompt}`);

    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4 } }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HuggingFace error ${response.status}: ${err}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: dataUrl },
    });

    return dataUrl;
  }

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
