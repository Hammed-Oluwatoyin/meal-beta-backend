import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { User } from '../database/entities';
import {
  AddPlanEntryDto,
  CreateMealPlanDto,
  MarkCompleteDto,
  SwapMealDto,
  UpdateMealPlanDto,
} from './dto';
import { MealPlansService } from './meal-plans.service';

@ApiTags('meal-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Get('me')
  findMine(@CurrentUser('id') patientId: string) {
    return this.mealPlansService.findForPatient(patientId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN)
  findAll() {
    return this.mealPlansService.findAllForDietitian();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.mealPlansService.findOne(id, user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN)
  create(
    @Body() dto: CreateMealPlanDto,
    @CurrentUser('id') dietitianId: string,
  ) {
    return this.mealPlansService.create(dto, dietitianId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN)
  update(@Param('id') id: string, @Body() dto: UpdateMealPlanDto) {
    return this.mealPlansService.update(id, dto);
  }

  @Post(':id/entries')
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN)
  addEntry(@Param('id') id: string, @Body() dto: AddPlanEntryDto) {
    return this.mealPlansService.addEntry(id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.DIETITIAN)
  publish(@Param('id') id: string) {
    return this.mealPlansService.publish(id);
  }

  @Patch(':id/entries/:entryId/swap')
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT)
  swapMeal(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() dto: SwapMealDto,
    @CurrentUser() user: User,
  ) {
    return this.mealPlansService.swapMeal(id, entryId, dto.mealId, user);
  }

  @Patch(':id/entries/:entryId/complete')
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT)
  markComplete(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() dto: MarkCompleteDto,
    @CurrentUser() user: User,
  ) {
    return this.mealPlansService.markComplete(
      id,
      entryId,
      dto.isCompleted,
      user,
    );
  }
}
