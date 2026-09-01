import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MealSlot, MealTag } from '../../common/enums';
import { User } from './user.entity';
import { MealPlanEntry } from './meal-plan-entry.entity';

export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  ingredients: MealIngredient[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  prepSteps: string[];

  @Column({ type: 'int', default: 0 })
  calories: number;

  @Column({ type: 'float', default: 0 })
  proteinG: number;

  @Column({ type: 'float', default: 0 })
  carbsG: number;

  @Column({ type: 'float', default: 0 })
  fatG: number;

  @Column({ type: 'enum', enum: MealTag, array: true, default: () => "'{}'" })
  tags: MealTag[];

  @Column({ type: 'enum', enum: MealSlot, default: MealSlot.LUNCH })
  defaultSlot: MealSlot;

  @Column({ type: 'float', default: 0 })
  costEstimatePerServing: number;

  @ManyToOne(() => User, (user) => user.createdMeals, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  createdBy: User | null;

  @Column({ nullable: true })
  createdById: string | null;

  @Column({ default: true })
  isPublished: boolean;

  @OneToMany(() => MealPlanEntry, (entry) => entry.meal)
  planEntries: MealPlanEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
