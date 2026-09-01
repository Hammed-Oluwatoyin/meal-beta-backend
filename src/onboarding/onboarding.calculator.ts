import { ActivityLevel, Gender, HealthGoal } from '../common/enums';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.LOW]: 1.2,
  [ActivityLevel.MODERATE]: 1.55,
  [ActivityLevel.HIGH]: 1.9,
};

const GOAL_CALORIE_ADJUSTMENT_PRIORITY: Array<{
  goals: HealthGoal[];
  adjustment: number;
}> = [
  { goals: [HealthGoal.WEIGHT_LOSS], adjustment: -500 },
  { goals: [HealthGoal.WEIGHT_GAIN, HealthGoal.MUSCLE_GAIN], adjustment: 300 },
];

export function calculateBmr(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === Gender.MALE) return base + 5;
  if (gender === Gender.FEMALE) return base - 161;
  return base - 78;
}

export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  return (
    ACTIVITY_MULTIPLIERS[activityLevel] ??
    ACTIVITY_MULTIPLIERS[ActivityLevel.LOW]
  );
}

export function getGoalCalorieAdjustment(healthGoals: HealthGoal[]): number {
  const match = GOAL_CALORIE_ADJUSTMENT_PRIORITY.find((entry) =>
    entry.goals.some((goal) => healthGoals.includes(goal)),
  );
  return match?.adjustment ?? 0;
}

export interface CalorieTargetInput {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  healthGoals: HealthGoal[];
}

export function calculateDailyCalorieTarget(input: CalorieTargetInput): number {
  const bmr = calculateBmr(
    input.gender,
    input.weightKg,
    input.heightCm,
    input.age,
  );
  const tdee = bmr * getActivityMultiplier(input.activityLevel);
  const adjusted = tdee + getGoalCalorieAdjustment(input.healthGoals);
  return Math.max(1200, Math.round(adjusted));
}

export function calculatePortionMultiplier(householdSize: number): number {
  return Math.max(1, householdSize);
}

export function determineHighRisk(medicalConditions: string[]): boolean {
  return Array.isArray(medicalConditions) && medicalConditions.length > 0;
}
