import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { MealSlot, PlanStatus, Role } from '../common/enums';
import { Meal, MealPlan, MealPlanEntry, User } from '../database/entities';
import { AddPlanEntryDto } from './dto/add-plan-entry.dto';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import {
  filterMealsForAllergies,
  filterMealsForConditions,
  filterMealsForPreferences,
} from './meal-filter.util';

const ALL_SLOTS = [
  MealSlot.BREAKFAST,
  MealSlot.LUNCH,
  MealSlot.DINNER,
  MealSlot.SNACK,
];

@Injectable()
export class MealPlansService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlansRepository: Repository<MealPlan>,
    @InjectRepository(MealPlanEntry)
    private readonly entriesRepository: Repository<MealPlanEntry>,
    @InjectRepository(Meal) private readonly mealsRepository: Repository<Meal>,
  ) {}

  private assertCanView(plan: MealPlan, user: User) {
    if (user.role === Role.DIETITIAN) return;
    if (plan.patientId !== user.id) {
      throw new ForbiddenException("Cannot access another patient's meal plan");
    }
  }

  async generateInitialPlan(
    patientId: string,
    needsReview: boolean,
    filters: {
      allergies?: string[];
      foodPreferences?: string[];
      medicalConditions?: string[];
    } = {},
  ): Promise<MealPlan> {
    const availableMeals = await this.mealsRepository.find({
      where: { isPublished: true },
    });
    const safeMeals = filterMealsForAllergies(
      availableMeals,
      filters.allergies ?? [],
    );
    const preferredMeals = filterMealsForPreferences(
      safeMeals,
      filters.foodPreferences ?? [],
    );
    const suitableMeals = filterMealsForConditions(
      preferredMeals,
      filters.medicalConditions ?? [],
    );

    // Never fall back below the allergy-safe set, even if preference/condition
    // narrowing leaves a slot empty.
    const mealsBySlot = new Map<MealSlot, Meal[]>(
      ALL_SLOTS.map((slot) => {
        const bySlot = (meals: Meal[]) =>
          meals.filter((meal) => meal.defaultSlot === slot);
        const candidates =
          bySlot(suitableMeals).length > 0
            ? bySlot(suitableMeals)
            : bySlot(preferredMeals).length > 0
              ? bySlot(preferredMeals)
              : bySlot(safeMeals);
        return [slot, candidates];
      }),
    );

    const plan = this.mealPlansRepository.create({
      patientId,
      weekStartDate: new Date().toISOString().slice(0, 10),
      status: needsReview ? PlanStatus.DRAFT : PlanStatus.PUBLISHED,
      needsReview,
      publishedAt: needsReview ? null : new Date(),
    });
    const savedPlan = await this.mealPlansRepository.save(plan);

    const entries: MealPlanEntry[] = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
      for (const slot of ALL_SLOTS) {
        const candidates = mealsBySlot.get(slot) ?? [];
        if (candidates.length === 0) continue;
        const meal =
          candidates[(dayOfWeek + entries.length) % candidates.length];
        entries.push(
          this.entriesRepository.create({
            mealPlanId: savedPlan.id,
            mealId: meal.id,
            dayOfWeek,
            slot,
          }),
        );
      }
    }
    if (entries.length) {
      await this.entriesRepository.save(entries);
    }
    return this.findOneRaw(savedPlan.id);
  }

  private async findOneRaw(id: string): Promise<MealPlan> {
    const plan = await this.mealPlansRepository.findOne({
      where: { id },
      relations: { entries: { meal: true } },
    });
    if (!plan) {
      throw new NotFoundException('Meal plan not found');
    }
    return plan;
  }

  async findOne(id: string, user: User): Promise<MealPlan> {
    const plan = await this.findOneRaw(id);
    this.assertCanView(plan, user);
    return plan;
  }

  async findForPatient(patientId: string): Promise<MealPlan[]> {
    return this.mealPlansRepository.find({
      where: { patientId },
      relations: { entries: { meal: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllForDietitian(): Promise<MealPlan[]> {
    const plans = await this.mealPlansRepository.find({
      relations: { entries: { meal: true }, patient: true },
      order: { createdAt: 'DESC' },
    });
    return plans.map((plan) => ({
      ...plan,
      patient: plan.patient
        ? (AuthService.sanitize(plan.patient) as User)
        : plan.patient,
    }));
  }

  async create(dto: CreateMealPlanDto, dietitianId: string): Promise<MealPlan> {
    const plan = this.mealPlansRepository.create({
      patientId: dto.patientId,
      dietitianId,
      weekStartDate: dto.weekStartDate,
      conditionTags: dto.conditionTags ?? [],
      notes: dto.notes ?? null,
      status: PlanStatus.DRAFT,
      needsReview: false,
    });
    const saved = await this.mealPlansRepository.save(plan);
    return this.findOneRaw(saved.id);
  }

  async update(id: string, dto: UpdateMealPlanDto): Promise<MealPlan> {
    const plan = await this.findOneRaw(id);
    Object.assign(plan, dto);
    await this.mealPlansRepository.save(plan);
    return this.findOneRaw(id);
  }

  async addEntry(planId: string, dto: AddPlanEntryDto): Promise<MealPlan> {
    await this.findOneRaw(planId);
    const meal = await this.mealsRepository.findOne({
      where: { id: dto.mealId },
    });
    if (!meal) {
      throw new NotFoundException('Meal not found');
    }
    const entry = this.entriesRepository.create({
      mealPlanId: planId,
      mealId: dto.mealId,
      dayOfWeek: dto.dayOfWeek,
      slot: dto.slot,
    });
    await this.entriesRepository.save(entry);
    return this.findOneRaw(planId);
  }

  async publish(id: string): Promise<MealPlan> {
    const plan = await this.findOneRaw(id);
    plan.status = PlanStatus.PUBLISHED;
    plan.needsReview = false;
    plan.publishedAt = new Date();
    await this.mealPlansRepository.save(plan);
    return this.findOneRaw(id);
  }

  async swapMeal(
    planId: string,
    entryId: string,
    mealId: string,
    patient: User,
  ): Promise<MealPlan> {
    const plan = await this.findOneRaw(planId);
    this.assertCanView(plan, patient);
    if (plan.patientId !== patient.id) {
      throw new ForbiddenException("Cannot modify another patient's meal plan");
    }
    const entry = await this.entriesRepository.findOne({
      where: { id: entryId, mealPlanId: planId },
    });
    if (!entry) {
      throw new NotFoundException('Meal plan entry not found');
    }
    const meal = await this.mealsRepository.findOne({ where: { id: mealId } });
    if (!meal) {
      throw new NotFoundException('Meal not found');
    }
    entry.mealId = mealId;
    await this.entriesRepository.save(entry);
    return this.findOneRaw(planId);
  }

  async markComplete(
    planId: string,
    entryId: string,
    isCompleted: boolean,
    patient: User,
  ): Promise<MealPlan> {
    const plan = await this.findOneRaw(planId);
    if (plan.patientId !== patient.id) {
      throw new ForbiddenException("Cannot modify another patient's meal plan");
    }
    const entry = await this.entriesRepository.findOne({
      where: { id: entryId, mealPlanId: planId },
    });
    if (!entry) {
      throw new NotFoundException('Meal plan entry not found');
    }
    entry.isCompleted = isCompleted;
    entry.completedAt = isCompleted ? new Date() : null;
    await this.entriesRepository.save(entry);
    return this.findOneRaw(planId);
  }
}
