import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DIETITIAN, Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('patients')
  listPatients() {
    return this.usersService.listPatients();
  }

  @Get('patients/:id')
  getPatientDetail(@Param('id') id: string) {
    return this.usersService.getPatientDetail(id);
  }

  @Get('dietitians')
  @Roles(Role.ADMIN)
  listDietitians() {
    return this.usersService.listDietitians();
  }
}
