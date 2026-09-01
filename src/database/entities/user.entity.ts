import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums';
import { Profile } from './profile.entity';
import { Meal } from './meal.entity';
import { MealPlan } from './meal-plan.entity';
import { ProgressLog } from './progress-log.entity';
import { CustomMealRequest } from './custom-meal-request.entity';
import { ShoppingList } from './shopping-list.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.PATIENT })
  role: Role;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Meal, (meal) => meal.createdBy)
  createdMeals: Meal[];

  @OneToMany(() => MealPlan, (plan) => plan.patient)
  mealPlansAsPatient: MealPlan[];

  @OneToMany(() => MealPlan, (plan) => plan.dietitian)
  mealPlansAsDietitian: MealPlan[];

  @OneToMany(() => ProgressLog, (log) => log.user)
  progressLogs: ProgressLog[];

  @OneToMany(() => CustomMealRequest, (request) => request.patient)
  customRequestsSubmitted: CustomMealRequest[];

  @OneToMany(() => CustomMealRequest, (request) => request.dietitian)
  customRequestsHandled: CustomMealRequest[];

  @OneToMany(() => ShoppingList, (list) => list.user)
  shoppingLists: ShoppingList[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
