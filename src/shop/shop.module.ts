import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MealPlan,
  Profile,
  ShoppingList,
  ShoppingListItem,
} from '../database/entities';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShoppingList,
      ShoppingListItem,
      MealPlan,
      Profile,
    ]),
  ],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
