import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CustomMealRequest,
  MealPlan,
  Profile,
  User,
} from '../database/entities';
import { DietitianDashboardController } from './dietitian-dashboard.controller';
import { DietitianDashboardService } from './dietitian-dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealPlan, Profile, CustomMealRequest, User]),
  ],
  controllers: [DietitianDashboardController],
  providers: [DietitianDashboardService],
})
export class DietitianModule {}
