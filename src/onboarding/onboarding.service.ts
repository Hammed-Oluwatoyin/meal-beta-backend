import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../database/entities';
import { MealPlansService } from '../meal-plans/meal-plans.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import {
  calculateDailyCalorieTarget,
  calculatePortionMultiplier,
  determineHighRisk,
} from './onboarding.calculator';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly mealPlansService: MealPlansService,
  ) {}

  async getStatus(userId: string) {
    const profile = await this.profilesRepository.findOne({
      where: { userId },
    });
    return { onboardingCompleted: !!profile?.onboardingCompletedAt, profile };
  }

  async submit(userId: string, dto: CreateOnboardingDto) {
    const isHighRisk = determineHighRisk(dto.medicalConditions);
    const dailyCalorieTarget = calculateDailyCalorieTarget({
      gender: dto.gender,
      weightKg: dto.weightKg,
      heightCm: dto.heightCm,
      age: dto.age,
      activityLevel: dto.activityLevel,
      healthGoals: dto.healthGoals,
    });
    const portionSizeMultiplier = calculatePortionMultiplier(dto.householdSize);

    let profile = await this.profilesRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profilesRepository.create({ userId });
    }
    Object.assign(profile, {
      age: dto.age,
      gender: dto.gender,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      householdSize: dto.householdSize,
      healthGoals: dto.healthGoals,
      activityLevel: dto.activityLevel,
      lifestyleInfo: dto.lifestyleInfo ?? null,
      dailySchedule: dto.dailySchedule ?? null,
      foodPreferences: dto.foodPreferences,
      allergies: dto.allergies ?? [],
      medicalConditions: dto.medicalConditions,
      budgetPerWeek: dto.budgetPerWeek,
      planType: dto.planType,
      dailyCalorieTarget,
      portionSizeMultiplier,
      isHighRisk,
      onboardingCompletedAt: new Date(),
    });
    await this.profilesRepository.save(profile);

    const mealPlan = await this.mealPlansService.generateInitialPlan(
      userId,
      isHighRisk,
      {
        allergies: dto.allergies ?? [],
        foodPreferences: dto.foodPreferences,
        medicalConditions: dto.medicalConditions,
      },
    );

    const estimatedWeeklyGroceryCost = mealPlan.entries.reduce(
      (total, entry) =>
        total + entry.meal.costEstimatePerServing * portionSizeMultiplier,
      0,
    );
    profile.estimatedWeeklyGroceryCost = estimatedWeeklyGroceryCost;
    await this.profilesRepository.save(profile);

    return { profile, mealPlan };
  }
}
