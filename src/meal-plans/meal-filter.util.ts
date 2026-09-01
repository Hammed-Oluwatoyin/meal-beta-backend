import { MealTag } from '../common/enums';
import { Meal } from '../database/entities';

const ALLERGY_KEYWORDS: Record<string, string[]> = {
  peanuts: ['peanut'],
  'tree nuts': [
    'almond',
    'cashew',
    'walnut',
    'pecan',
    'pistachio',
    'hazelnut',
    'macadamia',
  ],
  dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt'],
  gluten: ['wheat', 'flour', 'bread', 'pasta', 'semolina', 'barley', 'rye'],
  seafood: ['fish', 'shrimp', 'prawn', 'crab', 'lobster', 'salmon', 'tuna'],
  eggs: ['egg'],
  soy: ['soy', 'soya', 'tofu', 'edamame'],
  shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster'],
};

const PREFERENCE_TAG_MAP: Record<string, MealTag> = {
  vegetarian: MealTag.VEGETARIAN,
  vegan: MealTag.VEGAN,
  'low carb': MealTag.LOW_CARB,
  'high protein': MealTag.HIGH_PROTEIN,
};

const CONDITION_TAG_MAP: Record<string, MealTag> = {
  diabetes: MealTag.DIABETIC_FRIENDLY,
  'high blood pressure': MealTag.HEART_HEALTHY,
  'high cholesterol': MealTag.HEART_HEALTHY,
};

function mealMatchesKeyword(meal: Meal, keyword: string): boolean {
  const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
  const haystacks = [
    meal.name,
    meal.description ?? '',
    ...meal.ingredients.map((ingredient) => ingredient.name),
  ];
  return haystacks.some((text) => pattern.test(text));
}

export function filterMealsForAllergies(
  meals: Meal[],
  allergies: string[],
): Meal[] {
  if (!allergies?.length) return meals;
  const keywords = allergies.flatMap(
    (allergy) => ALLERGY_KEYWORDS[allergy.trim().toLowerCase()] ?? [],
  );
  if (!keywords.length) return meals;
  return meals.filter(
    (meal) => !keywords.some((keyword) => mealMatchesKeyword(meal, keyword)),
  );
}

function filterMealsByTagMap(
  meals: Meal[],
  labels: string[],
  tagMap: Record<string, MealTag>,
): Meal[] {
  const tags = labels
    .map((label) => tagMap[label.trim().toLowerCase()])
    .filter((tag): tag is MealTag => !!tag);
  if (!tags.length) return meals;
  const matching = meals.filter((meal) =>
    tags.every((tag) => meal.tags.includes(tag)),
  );
  return matching.length ? matching : meals;
}

export function filterMealsForPreferences(
  meals: Meal[],
  foodPreferences: string[],
): Meal[] {
  return filterMealsByTagMap(meals, foodPreferences, PREFERENCE_TAG_MAP);
}

export function filterMealsForConditions(
  meals: Meal[],
  medicalConditions: string[],
): Meal[] {
  return filterMealsByTagMap(meals, medicalConditions, CONDITION_TAG_MAP);
}
