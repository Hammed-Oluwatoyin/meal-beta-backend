import { MealSlot, MealTag } from '../common/enums';
import { Meal } from '../database/entities';
import {
  filterMealsForAllergies,
  filterMealsForConditions,
  filterMealsForPreferences,
} from './meal-filter.util';

function makeMeal(overrides: Partial<Meal>): Meal {
  return {
    id: overrides.id ?? 'meal-id',
    name: overrides.name ?? 'Meal',
    description: overrides.description ?? null,
    ingredients: overrides.ingredients ?? [],
    prepSteps: [],
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    tags: overrides.tags ?? [],
    defaultSlot: MealSlot.LUNCH,
    costEstimatePerServing: 0,
    createdBy: null,
    createdById: null,
    isPublished: true,
    planEntries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('filterMealsForAllergies', () => {
  const peanutMeal = makeMeal({
    name: 'Apple with Peanut Butter',
    ingredients: [{ name: 'Peanut butter', quantity: 1, unit: 'tbsp' }],
  });
  const coconutMeal = makeMeal({
    name: 'Coconut Rice',
    ingredients: [{ name: 'Coconut milk', quantity: 200, unit: 'ml' }],
  });

  it('excludes meals whose ingredients match an allergy keyword', () => {
    const result = filterMealsForAllergies(
      [peanutMeal, coconutMeal],
      ['Peanuts'],
    );
    expect(result).toEqual([coconutMeal]);
  });

  it('does not false-positive on substrings like coconut vs nut', () => {
    const result = filterMealsForAllergies([coconutMeal], ['Tree Nuts']);
    expect(result).toEqual([coconutMeal]);
  });

  it('returns all meals when no allergies are given', () => {
    expect(filterMealsForAllergies([peanutMeal, coconutMeal], [])).toEqual([
      peanutMeal,
      coconutMeal,
    ]);
  });
});

describe('filterMealsForPreferences', () => {
  const veganMeal = makeMeal({ name: 'Vegan Bowl', tags: [MealTag.VEGAN] });
  const meatMeal = makeMeal({ name: 'Chicken', tags: [] });

  it('keeps only meals matching a recognized preference tag', () => {
    expect(filterMealsForPreferences([veganMeal, meatMeal], ['Vegan'])).toEqual(
      [veganMeal],
    );
  });

  it('falls back to the full list when the filter would leave nothing', () => {
    expect(filterMealsForPreferences([meatMeal], ['Vegan'])).toEqual([
      meatMeal,
    ]);
  });

  it('ignores preferences with no known tag mapping', () => {
    expect(
      filterMealsForPreferences([veganMeal, meatMeal], ['Local Nigerian']),
    ).toEqual([veganMeal, meatMeal]);
  });
});

describe('filterMealsForConditions', () => {
  const heartHealthyMeal = makeMeal({
    name: 'Salmon',
    tags: [MealTag.HEART_HEALTHY],
  });
  const otherMeal = makeMeal({ name: 'Pasta', tags: [] });

  it('keeps only meals matching a recognized condition tag', () => {
    expect(
      filterMealsForConditions(
        [heartHealthyMeal, otherMeal],
        ['High Blood Pressure'],
      ),
    ).toEqual([heartHealthyMeal]);
  });

  it('falls back to the full list when nothing matches', () => {
    expect(filterMealsForConditions([otherMeal], ['High Cholesterol'])).toEqual(
      [otherMeal],
    );
  });
});
