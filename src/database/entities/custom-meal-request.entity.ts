import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RequestStatus } from '../../common/enums';
import { User } from './user.entity';
import { MealPlan } from './meal-plan.entity';

@Entity('custom_meal_requests')
export class CustomMealRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.customRequestsSubmitted, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: User;

  @Column()
  patientId: string;

  @ManyToOne(() => User, (user) => user.customRequestsHandled, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  dietitian: User | null;

  @Column({ nullable: true })
  dietitianId: string | null;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ type: 'text' })
  details: string;

  @OneToOne(() => MealPlan, (plan) => plan.originatingRequest, {
    nullable: true,
  })
  @JoinColumn()
  resultingMealPlan: MealPlan | null;

  @Column({ nullable: true })
  resultingMealPlanId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
