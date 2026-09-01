import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MealPlan,
  Profile,
  ShoppingList,
  ShoppingListItem,
} from '../database/entities';
import { AddShoppingItemDto } from './dto/add-shopping-item.dto';
import { UpdateShoppingItemDto } from './dto/update-shopping-item.dto';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(ShoppingList)
    private readonly listsRepository: Repository<ShoppingList>,
    @InjectRepository(ShoppingListItem)
    private readonly itemsRepository: Repository<ShoppingListItem>,
    @InjectRepository(MealPlan)
    private readonly mealPlansRepository: Repository<MealPlan>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  private async findOwnedList(
    id: string,
    userId: string,
  ): Promise<ShoppingList> {
    const list = await this.listsRepository.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!list) {
      throw new NotFoundException('Shopping list not found');
    }
    if (list.userId !== userId) {
      throw new ForbiddenException(
        "Cannot access another patient's shopping list",
      );
    }
    return list;
  }

  async generateFromPlan(
    mealPlanId: string,
    userId: string,
  ): Promise<ShoppingList> {
    const plan = await this.mealPlansRepository.findOne({
      where: { id: mealPlanId },
      relations: { entries: { meal: true } },
    });
    if (!plan) {
      throw new NotFoundException('Meal plan not found');
    }
    if (plan.patientId !== userId) {
      throw new ForbiddenException(
        "Cannot generate a shopping list for another patient's meal plan",
      );
    }
    const profile = await this.profilesRepository.findOne({
      where: { userId },
    });
    const scale = profile?.portionSizeMultiplier ?? 1;

    const existing = await this.listsRepository.findOne({
      where: { mealPlanId },
      relations: { items: true },
    });
    if (existing) {
      await this.itemsRepository.remove(existing.items);
      await this.listsRepository.remove(existing);
    }

    const aggregated = new Map<
      string,
      { name: string; category: string; unit: string; quantity: number }
    >();
    for (const entry of plan.entries) {
      for (const ingredient of entry.meal.ingredients) {
        const key = `${ingredient.name.toLowerCase()}|${ingredient.unit.toLowerCase()}`;
        const current = aggregated.get(key);
        const quantity = ingredient.quantity * scale;
        if (current) {
          current.quantity += quantity;
        } else {
          aggregated.set(key, {
            name: ingredient.name,
            category: ingredient.category ?? 'Other',
            unit: ingredient.unit,
            quantity,
          });
        }
      }
    }

    const list = await this.listsRepository.save(
      this.listsRepository.create({ userId, mealPlanId }),
    );
    const items = Array.from(aggregated.values()).map((entry) =>
      this.itemsRepository.create({ shoppingListId: list.id, ...entry }),
    );
    if (items.length) {
      await this.itemsRepository.save(items);
    }
    return this.findOwnedList(list.id, userId);
  }

  async findForUser(userId: string): Promise<ShoppingList[]> {
    return this.listsRepository.find({
      where: { userId },
      relations: { items: true },
      order: { generatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<ShoppingList> {
    return this.findOwnedList(id, userId);
  }

  async addItem(
    listId: string,
    dto: AddShoppingItemDto,
    userId: string,
  ): Promise<ShoppingList> {
    await this.findOwnedList(listId, userId);
    const item = this.itemsRepository.create({
      shoppingListId: listId,
      name: dto.name,
      category: dto.category ?? 'Other',
      quantity: dto.quantity,
      unit: dto.unit,
    });
    await this.itemsRepository.save(item);
    return this.findOwnedList(listId, userId);
  }

  async updateItem(
    listId: string,
    itemId: string,
    dto: UpdateShoppingItemDto,
    userId: string,
  ): Promise<ShoppingList> {
    await this.findOwnedList(listId, userId);
    const item = await this.itemsRepository.findOne({
      where: { id: itemId, shoppingListId: listId },
    });
    if (!item) {
      throw new NotFoundException('Shopping list item not found');
    }
    Object.assign(item, dto);
    await this.itemsRepository.save(item);
    return this.findOwnedList(listId, userId);
  }

  async removeItem(
    listId: string,
    itemId: string,
    userId: string,
  ): Promise<ShoppingList> {
    await this.findOwnedList(listId, userId);
    const item = await this.itemsRepository.findOne({
      where: { id: itemId, shoppingListId: listId },
    });
    if (!item) {
      throw new NotFoundException('Shopping list item not found');
    }
    await this.itemsRepository.remove(item);
    return this.findOwnedList(listId, userId);
  }
}
