import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MealPlan } from './meal-plan.entity';
import { ShoppingListItem } from './shopping-list-item.entity';

@Entity('shopping_lists')
export class ShoppingList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.shoppingLists, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => MealPlan, { onDelete: 'CASCADE' })
  @JoinColumn()
  mealPlan: MealPlan;

  @Column()
  mealPlanId: string;

  @OneToMany(() => ShoppingListItem, (item) => item.shoppingList, {
    cascade: true,
  })
  items: ShoppingListItem[];

  @CreateDateColumn()
  generatedAt: Date;
}
