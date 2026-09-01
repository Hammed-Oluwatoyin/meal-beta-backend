import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { PlanStatus, RequestStatus, Role } from '../common/enums';
import {
  CustomMealRequest,
  MealPlan,
  Profile,
  User,
} from '../database/entities';

@Injectable()
export class DietitianDashboardService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlansRepository: Repository<MealPlan>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    @InjectRepository(CustomMealRequest)
    private readonly requestsRepository: Repository<CustomMealRequest>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getSummary() {
    const [
      plansNeedingReview,
      pendingRequestsCount,
      highRiskProfiles,
      activePatientsCount,
      publishedPlansCount,
      recentRequests,
    ] = await Promise.all([
      this.mealPlansRepository.count({ where: { needsReview: true } }),
      this.requestsRepository.count({
        where: { status: RequestStatus.PENDING },
      }),
      this.profilesRepository.find({
        where: { isHighRisk: true },
        relations: { user: true },
      }),
      this.usersRepository.count({ where: { role: Role.PATIENT } }),
      this.mealPlansRepository.count({
        where: { status: PlanStatus.PUBLISHED },
      }),
      this.requestsRepository.find({
        where: [
          { status: RequestStatus.PENDING },
          { status: RequestStatus.IN_REVIEW },
        ],
        relations: { patient: true },
        order: { createdAt: 'ASC' },
        take: 5,
      }),
    ]);

    return {
      pendingReviews: {
        mealPlansNeedingReview: plansNeedingReview,
        pendingCustomRequests: pendingRequestsCount,
      },
      highRiskPatients: highRiskProfiles.map((profile) => ({
        userId: profile.userId,
        email: profile.user?.email,
        medicalConditions: profile.medicalConditions,
      })),
      analytics: {
        activePatientsCount,
        publishedPlansCount,
      },
      recentRequests: recentRequests.map((request) => ({
        ...request,
        patient: request.patient
          ? AuthService.sanitize(request.patient)
          : request.patient,
      })),
    };
  }
}
