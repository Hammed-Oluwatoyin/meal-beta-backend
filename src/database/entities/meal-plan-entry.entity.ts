import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MealSlot } from '../../common/enums';
import { MealPlan } from './meal-plan.entity';
import { Meal } from './meal.entity';

@Entity('meal_plan_entries')
@Unique(['mealPlanId', 'dayOfWeek', 'slot'])
export class MealPlanEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MealPlan, (plan) => plan.entries, { onDelete: 'CASCADE' })
  @JoinColumn()
  mealPlan: MealPlan;

  @Column()
  mealPlanId: string;

  @ManyToOne(() => Meal, (meal) => meal.planEntries, { onDelete: 'RESTRICT' })
  @JoinColumn()
  meal: Meal;

  @Column()
  mealId: string;

  @Column({ type: 'int' })
  dayOfWeek: number;

  @Column({ type: 'enum', enum: MealSlot })
  slot: MealSlot;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
