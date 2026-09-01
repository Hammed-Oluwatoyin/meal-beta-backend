import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanStatus } from '../../common/enums';
import { User } from './user.entity';
import { MealPlanEntry } from './meal-plan-entry.entity';
import { CustomMealRequest } from './custom-meal-request.entity';

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.mealPlansAsPatient, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: User;

  @Column()
  patientId: string;

  @ManyToOne(() => User, (user) => user.mealPlansAsDietitian, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  dietitian: User | null;

  @Column({ nullable: true })
  dietitianId: string | null;

  @Column({ type: 'date' })
  weekStartDate: string;

  @Column({ type: 'enum', enum: PlanStatus, default: PlanStatus.DRAFT })
  status: PlanStatus;

  @Column({ default: false })
  needsReview: boolean;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  conditionTags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @OneToMany(() => MealPlanEntry, (entry) => entry.mealPlan, { cascade: true })
  entries: MealPlanEntry[];

  @OneToOne(() => CustomMealRequest, (request) => request.resultingMealPlan)
  originatingRequest: CustomMealRequest | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
