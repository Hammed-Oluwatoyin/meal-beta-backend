import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { LogProgressDto } from './dto/log-progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser('id') userId: string) {
    return this.progressService.getDashboard(userId);
  }

  @Get('logs')
  getLogs(@CurrentUser('id') userId: string) {
    return this.progressService.getLogs(userId);
  }

  @Post('logs')
  log(@CurrentUser('id') userId: string, @Body() dto: LogProgressDto) {
    return this.progressService.log(userId, dto);
  }
}
