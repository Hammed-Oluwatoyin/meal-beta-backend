import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../common/decorators';
import { Role, RequestStatus } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { User } from '../database/entities';
import { CustomRequestsService } from './custom-requests.service';
import { DeliverRequestDto, SubmitRequestDto } from './dto';

@ApiTags('custom-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('custom-requests')
export class CustomRequestsController {
  constructor(private readonly customRequestsService: CustomRequestsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT)
  submit(@CurrentUser('id') patientId: string, @Body() dto: SubmitRequestDto) {
    return this.customRequestsService.submit(patientId, dto);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT)
  findMine(@CurrentUser('id') patientId: string) {
    return this.customRequestsService.findMine(patientId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN)
  findQueue(@Query('status') status?: RequestStatus) {
    return this.customRequestsService.findQueue(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.customRequestsService.findOne(
      id,
      user.id,
      user.role === Role.DIETITIAN,
    );
  }

  @Patch(':id/claim')
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN)
  claim(@Param('id') id: string, @CurrentUser('id') dietitianId: string) {
    return this.customRequestsService.claim(id, dietitianId);
  }

  @Post(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN)
  deliver(
    @Param('id') id: string,
    @Body() dto: DeliverRequestDto,
    @CurrentUser('id') dietitianId: string,
  ) {
    return this.customRequestsService.deliver(id, dietitianId, dto);
  }
}
