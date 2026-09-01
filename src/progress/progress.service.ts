import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthGoal, PlanStatus } from '../common/enums';
import { MealPlan, Profile, ProgressLog } from '../database/entities';
import { LogProgressDto } from './dto/log-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(ProgressLog)
    private readonly logsRepository: Repository<ProgressLog>,
    @InjectRepository(MealPlan)
    private readonly mealPlansRepository: Repository<MealPlan>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  async log(userId: string, dto: LogProgressDto): Promise<ProgressLog> {
    let entry = await this.logsRepository.findOne({
      where: { userId, date: dto.date },
    });
    if (!entry) {
      entry = this.logsRepository.create({ userId, date: dto.date });
    }
    entry.weightKg = dto.weightKg ?? entry.weightKg ?? null;
    entry.caloriesConsumed =
      dto.caloriesConsumed ?? entry.caloriesConsumed ?? null;
    entry.notes = dto.notes ?? entry.notes ?? null;
    return this.logsRepository.save(entry);
  }

  async getLogs(userId: string): Promise<ProgressLog[]> {
    return this.logsRepository.find({
      where: { userId },
      order: { date: 'ASC' },
    });
  }

  private calculateLoggingStreak(logs: ProgressLog[]): number {
    const dates = new Set(logs.map((log) => log.date));
    let streak = 0;
    const cursor = new Date();
    for (;;) {
      const iso = cursor.toISOString().slice(0, 10);
      if (!dates.has(iso)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  async getDashboard(userId: string) {
    const [logs, latestPlan, profile] = await Promise.all([
      this.getLogs(userId),
      this.mealPlansRepository.findOne({
        where: { patientId: userId, status: PlanStatus.PUBLISHED },
        relations: { entries: true },
        order: { createdAt: 'DESC' },
      }),
      this.profilesRepository.findOne({ where: { userId } }),
    ]);

    const weightTrend = logs
      .filter((log) => log.weightKg != null)
      .map((log) => ({ date: log.date, weightKg: log.weightKg }));
    const calorieTrend = logs
      .filter((log) => log.caloriesConsumed != null)
      .map((log) => ({
        date: log.date,
        caloriesConsumed: log.caloriesConsumed,
      }));

    const totalMealsThisWeek = latestPlan?.entries.length ?? 0;
    const mealsCompletedThisWeek =
      latestPlan?.entries.filter((entry) => entry.isCompleted).length ?? 0;
    const loggingStreakDays = this.calculateLoggingStreak(logs);

    const recommendations: string[] = [];
    if (
      totalMealsThisWeek > 0 &&
      mealsCompletedThisWeek / totalMealsThisWeek < 0.5
    ) {
      recommendations.push(
        "You have completed less than half of this week's planned meals — try to catch up.",
      );
    }
    if (loggingStreakDays === 0) {
      recommendations.push("Log today's progress to start a new streak.");
    }
    if (
      profile?.healthGoals?.includes(HealthGoal.WEIGHT_LOSS) &&
      weightTrend.length >= 2
    ) {
      const [first, last] = [
        weightTrend[0],
        weightTrend[weightTrend.length - 1],
      ];
      if ((last.weightKg ?? 0) >= (first.weightKg ?? 0)) {
        recommendations.push(
          'Your weight trend is flat or rising against a weight-loss goal — consider a check-in with your dietitian.',
        );
      }
    }

    return {
      loggingStreakDays,
      mealsCompletedThisWeek,
      totalMealsThisWeek,
      weightTrend,
      calorieTrend,
      recommendations,
    };
  }
}
