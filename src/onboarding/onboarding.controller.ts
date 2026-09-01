import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  getStatus(@CurrentUser('id') userId: string) {
    return this.onboardingService.getStatus(userId);
  }

  @Post()
  submit(@CurrentUser('id') userId: string, @Body() dto: CreateOnboardingDto) {
    return this.onboardingService.submit(userId, dto);
  }
}
