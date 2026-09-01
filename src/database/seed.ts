import * as bcrypt from 'bcrypt';
import { MealSlot, MealTag, Role } from '../common/enums';
import dataSource from './data-source';
import { Meal, User } from './entities';

const SEED_MEALS: Array<Partial<Meal>> = [
  {
    name: 'Greek Yogurt with Berries',
    description: 'High-protein yogurt bowl with mixed berries and honey.',
    ingredients: [
      { name: 'Greek yogurt', quantity: 200, unit: 'g', category: 'Dairy' },
      { name: 'Mixed berries', quantity: 80, unit: 'g', category: 'Produce' },
      { name: 'Honey', quantity: 1, unit: 'tbsp', category: 'Pantry' },
    ],
    prepSteps: ['Add yogurt to a bowl', 'Top with berries and honey'],
    calories: 280,
    proteinG: 20,
    carbsG: 32,
    fatG: 6,
    tags: [MealTag.VEGETARIAN, MealTag.GLUTEN_FREE, MealTag.HIGH_PROTEIN],
    defaultSlot: MealSlot.BREAKFAST,
    costEstimatePerServing: 2.5,
  },
  {
    name: 'Oatmeal with Banana',
    description: 'Rolled oats with sliced banana and cinnamon.',
    ingredients: [
      { name: 'Rolled oats', quantity: 60, unit: 'g', category: 'Pantry' },
      { name: 'Banana', quantity: 1, unit: 'unit', category: 'Produce' },
      { name: 'Milk', quantity: 200, unit: 'ml', category: 'Dairy' },
    ],
    prepSteps: ['Cook oats with milk', 'Top with sliced banana'],
    calories: 320,
    proteinG: 10,
    carbsG: 55,
    fatG: 6,
    tags: [MealTag.VEGETARIAN],
    defaultSlot: MealSlot.BREAKFAST,
    costEstimatePerServing: 1.5,
  },
  {
    name: 'Grilled Chicken Salad',
    description: 'Grilled chicken breast over mixed greens.',
    ingredients: [
      { name: 'Chicken breast', quantity: 150, unit: 'g', category: 'Meat' },
      { name: 'Mixed greens', quantity: 100, unit: 'g', category: 'Produce' },
      { name: 'Cherry tomatoes', quantity: 60, unit: 'g', category: 'Produce' },
      { name: 'Olive oil', quantity: 1, unit: 'tbsp', category: 'Pantry' },
    ],
    prepSteps: [
      'Grill chicken breast',
      'Toss with greens, tomatoes and olive oil',
    ],
    calories: 420,
    proteinG: 40,
    carbsG: 12,
    fatG: 18,
    tags: [MealTag.GLUTEN_FREE, MealTag.HIGH_PROTEIN, MealTag.LOW_CARB],
    defaultSlot: MealSlot.LUNCH,
    costEstimatePerServing: 4.5,
  },
  {
    name: 'Lentil Soup',
    description: 'Hearty lentil soup with vegetables.',
    ingredients: [
      { name: 'Red lentils', quantity: 100, unit: 'g', category: 'Pantry' },
      { name: 'Carrot', quantity: 1, unit: 'unit', category: 'Produce' },
      { name: 'Onion', quantity: 1, unit: 'unit', category: 'Produce' },
      {
        name: 'Vegetable stock',
        quantity: 500,
        unit: 'ml',
        category: 'Pantry',
      },
    ],
    prepSteps: [
      'Saute onion and carrot',
      'Add lentils and stock',
      'Simmer 25 minutes',
    ],
    calories: 350,
    proteinG: 18,
    carbsG: 55,
    fatG: 4,
    tags: [
      MealTag.VEGAN,
      MealTag.VEGETARIAN,
      MealTag.DAIRY_FREE,
      MealTag.HEART_HEALTHY,
    ],
    defaultSlot: MealSlot.LUNCH,
    costEstimatePerServing: 2.0,
  },
  {
    name: 'Baked Salmon with Vegetables',
    description: 'Oven-baked salmon fillet with roasted vegetables.',
    ingredients: [
      { name: 'Salmon fillet', quantity: 150, unit: 'g', category: 'Seafood' },
      { name: 'Broccoli', quantity: 100, unit: 'g', category: 'Produce' },
      { name: 'Sweet potato', quantity: 150, unit: 'g', category: 'Produce' },
    ],
    prepSteps: ['Season salmon and vegetables', 'Bake at 200C for 20 minutes'],
    calories: 480,
    proteinG: 38,
    carbsG: 35,
    fatG: 20,
    tags: [MealTag.GLUTEN_FREE, MealTag.HEART_HEALTHY, MealTag.HIGH_PROTEIN],
    defaultSlot: MealSlot.DINNER,
    costEstimatePerServing: 6.0,
  },
  {
    name: 'Vegetable Stir Fry with Tofu',
    description: 'Stir-fried vegetables and tofu in a light soy sauce.',
    ingredients: [
      { name: 'Firm tofu', quantity: 150, unit: 'g', category: 'Pantry' },
      {
        name: 'Mixed stir-fry vegetables',
        quantity: 200,
        unit: 'g',
        category: 'Produce',
      },
      { name: 'Soy sauce', quantity: 2, unit: 'tbsp', category: 'Pantry' },
      { name: 'Rice', quantity: 100, unit: 'g', category: 'Pantry' },
    ],
    prepSteps: [
      'Pan-fry tofu until golden',
      'Stir fry vegetables',
      'Combine with sauce and serve over rice',
    ],
    calories: 410,
    proteinG: 22,
    carbsG: 50,
    fatG: 12,
    tags: [MealTag.VEGAN, MealTag.VEGETARIAN, MealTag.DAIRY_FREE],
    defaultSlot: MealSlot.DINNER,
    costEstimatePerServing: 3.5,
  },
  {
    name: 'Apple with Almond Butter',
    description: 'Sliced apple with a side of almond butter.',
    ingredients: [
      { name: 'Apple', quantity: 1, unit: 'unit', category: 'Produce' },
      { name: 'Almond butter', quantity: 2, unit: 'tbsp', category: 'Pantry' },
    ],
    prepSteps: ['Slice apple', 'Serve with almond butter'],
    calories: 220,
    proteinG: 6,
    carbsG: 26,
    fatG: 12,
    tags: [
      MealTag.VEGAN,
      MealTag.VEGETARIAN,
      MealTag.GLUTEN_FREE,
      MealTag.DAIRY_FREE,
    ],
    defaultSlot: MealSlot.SNACK,
    costEstimatePerServing: 1.2,
  },
  {
    name: 'Mixed Nuts',
    description: 'A handful of unsalted mixed nuts.',
    ingredients: [
      { name: 'Mixed nuts', quantity: 30, unit: 'g', category: 'Pantry' },
    ],
    prepSteps: ['Portion into a bowl'],
    calories: 180,
    proteinG: 6,
    carbsG: 6,
    fatG: 16,
    tags: [
      MealTag.VEGAN,
      MealTag.VEGETARIAN,
      MealTag.GLUTEN_FREE,
      MealTag.DAIRY_FREE,
      MealTag.HIGH_PROTEIN,
    ],
    defaultSlot: MealSlot.SNACK,
    costEstimatePerServing: 1.0,
  },
];

async function seed() {
  const source = await dataSource.initialize();
  const userRepo = source.getRepository(User);
  const mealRepo = source.getRepository(Meal);

  const adminEmail = 'admin@mealbeta.dev';
  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = userRepo.create({
      email: adminEmail,
      passwordHash: await bcrypt.hash('ChangeMe123!', 10),
      role: Role.ADMIN,
      isVerified: true,
    });
    await userRepo.save(admin);
    console.log(`Seeded admin account: ${adminEmail} / ChangeMe123!`);
  } else {
    console.log('Admin account already exists, skipping.');
  }

  const dietitianEmail = 'dietitian@mealbeta.dev';
  let dietitian = await userRepo.findOne({ where: { email: dietitianEmail } });
  if (!dietitian) {
    dietitian = userRepo.create({
      email: dietitianEmail,
      passwordHash: await bcrypt.hash('ChangeMe123!', 10),
      role: Role.DIETITIAN,
      isVerified: true,
    });
    await userRepo.save(dietitian);
    console.log(`Seeded dietitian account: ${dietitianEmail} / ChangeMe123!`);
  } else {
    console.log('Dietitian account already exists, skipping.');
  }

  for (const mealData of SEED_MEALS) {
    const existing = await mealRepo.findOne({ where: { name: mealData.name } });
    if (existing) continue;
    const meal = mealRepo.create({
      ...mealData,
      createdById: dietitian.id,
      isPublished: true,
    });
    await mealRepo.save(meal);
  }
  console.log(
    `Seeded ${SEED_MEALS.length} library meals (skipping any that already existed).`,
  );

  await source.destroy();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
