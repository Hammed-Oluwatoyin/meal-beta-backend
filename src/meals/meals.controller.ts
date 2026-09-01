import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { CreateMealDto, QueryMealsDto, UpdateMealDto } from './dto';
import { MealsService } from './meals.service';

@ApiTags('meals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  findAll(@Query() query: QueryMealsDto) {
    return this.mealsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mealsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN, Role.ADMIN)
  create(@Body() dto: CreateMealDto, @CurrentUser('id') dietitianId: string) {
    return this.mealsService.create(dto, dietitianId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMealDto) {
    return this.mealsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.mealsService.remove(id);
  }
}
