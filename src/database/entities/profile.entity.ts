import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ActivityLevel,
  Gender,
  HealthGoal,
  PlanType,
} from '../../common/enums';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ type: 'float', nullable: true })
  heightCm: number | null;

  @Column({ type: 'float', nullable: true })
  weightKg: number | null;

  @Column({ type: 'int', default: 1 })
  householdSize: number;

  @Column({
    type: 'enum',
    enum: HealthGoal,
    array: true,
    default: () => "'{}'",
  })
  healthGoals: HealthGoal[];

  @Column({ type: 'enum', enum: ActivityLevel, nullable: true })
  activityLevel: ActivityLevel | null;

  @Column({ type: 'text', nullable: true })
  lifestyleInfo: string | null;

  @Column({ type: 'text', nullable: true })
  dailySchedule: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  foodPreferences: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  allergies: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  medicalConditions: string[];

  @Column({ type: 'float', nullable: true })
  budgetPerWeek: number | null;

  @Column({ type: 'enum', enum: PlanType, default: PlanType.SINGLE })
  planType: PlanType;

  @Column({ type: 'int', nullable: true })
  dailyCalorieTarget: number | null;

  @Column({ type: 'float', default: 1 })
  portionSizeMultiplier: number;

  @Column({ type: 'float', nullable: true })
  estimatedWeeklyGroceryCost: number | null;

  @Column({ default: false })
  isHighRisk: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  onboardingCompletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
