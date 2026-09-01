import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomMealRequest } from '../database/entities';
import { MealPlansModule } from '../meal-plans/meal-plans.module';
import { CustomRequestsController } from './custom-requests.controller';
import { CustomRequestsService } from './custom-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomMealRequest]), MealPlansModule],
  controllers: [CustomRequestsController],
  providers: [CustomRequestsService],
})
export class CustomRequestsModule {}
