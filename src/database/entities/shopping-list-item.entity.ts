import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ShoppingList } from './shopping-list.entity';

@Entity('shopping_list_items')
export class ShoppingListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ShoppingList, (list) => list.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  shoppingList: ShoppingList;

  @Column()
  shoppingListId: string;

  @Column()
  name: string;

  @Column({ default: 'Other' })
  category: string;

  @Column({ type: 'float' })
  quantity: number;

  @Column()
  unit: string;

  @Column({ default: false })
  isChecked: boolean;
}
