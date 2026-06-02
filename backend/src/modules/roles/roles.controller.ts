import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth('access-token')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: '[Admin] Listar roles y permisos' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Post('assign/:userId')
  @ApiOperation({ summary: '[Admin] Asignar rol a usuario' })
  assign(@Param('userId') userId: string, @Body() body: { role: string }) {
    return this.rolesService.assignRoleToUser(userId, body.role);
  }
}
