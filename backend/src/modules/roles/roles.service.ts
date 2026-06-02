import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
  }

  async assignRoleToUser(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error('Rol no encontrado');
    return this.prisma.user.update({ where: { id: userId }, data: { roleId: role.id } });
  }
}
