import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Estadísticas generales de la plataforma' })
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('student')
  @ApiOperation({ summary: 'Dashboard del estudiante autenticado' })
  getStudentDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getStudentDashboard(userId);
  }
}
