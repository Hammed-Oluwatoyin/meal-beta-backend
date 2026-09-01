import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DIETITIAN)
@Controller('users/patients')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listPatients() {
    return this.usersService.listPatients();
  }

  @Get(':id')
  getPatientDetail(@Param('id') id: string) {
    return this.usersService.getPatientDetail(id);
  }
}
