import { ActivityLevel, Gender, HealthGoal } from '../common/enums';
import {
  calculateBmr,
  calculateDailyCalorieTarget,
  calculatePortionMultiplier,
  determineHighRisk,
  getActivityMultiplier,
  getGoalCalorieAdjustment,
} from './onboarding.calculator';

describe('onboarding.calculator', () => {
  describe('calculateBmr', () => {
    it('computes BMR for men with the +5 offset', () => {
      expect(calculateBmr(Gender.MALE, 80, 180, 30)).toBeCloseTo(
        10 * 80 + 6.25 * 180 - 5 * 30 + 5,
      );
    });

    it('computes BMR for women with the -161 offset', () => {
      expect(calculateBmr(Gender.FEMALE, 65, 165, 28)).toBeCloseTo(
        10 * 65 + 6.25 * 165 - 5 * 28 - 161,
      );
    });

    it('averages the two offsets for other genders', () => {
      expect(calculateBmr(Gender.OTHER, 70, 170, 25)).toBeCloseTo(
        10 * 70 + 6.25 * 170 - 5 * 25 - 78,
      );
    });
  });

  describe('getActivityMultiplier', () => {
    it('maps every activity level to its multiplier', () => {
      expect(getActivityMultiplier(ActivityLevel.LOW)).toBe(1.2);
      expect(getActivityMultiplier(ActivityLevel.HIGH)).toBe(1.9);
    });
  });

  describe('getGoalCalorieAdjustment', () => {
    it('applies a deficit for weight loss', () => {
      expect(getGoalCalorieAdjustment([HealthGoal.WEIGHT_LOSS])).toBe(-500);
    });

    it('applies a surplus for weight/muscle gain', () => {
      expect(getGoalCalorieAdjustment([HealthGoal.MUSCLE_GAIN])).toBe(300);
    });

    it('applies no adjustment for maintenance-style goals', () => {
      expect(getGoalCalorieAdjustment([HealthGoal.GENERAL_HEALTH])).toBe(0);
    });

    it('prioritizes weight loss over a conflicting gain goal', () => {
      expect(
        getGoalCalorieAdjustment([
          HealthGoal.WEIGHT_GAIN,
          HealthGoal.WEIGHT_LOSS,
        ]),
      ).toBe(-500);
    });
  });

  describe('calculateDailyCalorieTarget', () => {
    it('never drops below the 1200 kcal safety floor', () => {
      const target = calculateDailyCalorieTarget({
        gender: Gender.FEMALE,
        weightKg: 45,
        heightCm: 150,
        age: 70,
        activityLevel: ActivityLevel.LOW,
        healthGoals: [HealthGoal.WEIGHT_LOSS],
      });
      expect(target).toBeGreaterThanOrEqual(1200);
    });
  });

  describe('calculatePortionMultiplier', () => {
    it('never scales below 1 household member', () => {
      expect(calculatePortionMultiplier(0)).toBe(1);
      expect(calculatePortionMultiplier(4)).toBe(4);
    });
  });

  describe('determineHighRisk', () => {
    it('flags any listed medical condition as high risk', () => {
      expect(determineHighRisk(['diabetes'])).toBe(true);
    });

    it('treats no medical conditions as not high risk', () => {
      expect(determineHighRisk([])).toBe(false);
    });
  });
});
