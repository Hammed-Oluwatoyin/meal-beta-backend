import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan, Profile, ProgressLog } from '../database/entities';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressLog, MealPlan, Profile])],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
