import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { DietitianDashboardService } from './dietitian-dashboard.service';

@ApiTags('dietitian')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DIETITIAN, Role.ADMIN)
@Controller('dietitian/dashboard')
export class DietitianDashboardController {
  constructor(private readonly dashboardService: DietitianDashboardService) {}

  @Get()
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
