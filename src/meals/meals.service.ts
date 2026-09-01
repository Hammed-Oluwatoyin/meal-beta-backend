import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from '../database/entities';
import { CreateMealDto } from './dto/create-meal.dto';
import { QueryMealsDto } from './dto/query-meals.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal) private readonly mealsRepository: Repository<Meal>,
  ) {}

  async findAll(query: QueryMealsDto): Promise<Meal[]> {
    const qb = this.mealsRepository
      .createQueryBuilder('meal')
      .where('meal.isPublished = :isPublished', { isPublished: true });

    if (query.search) {
      qb.andWhere('meal.name ILIKE :search', { search: `%${query.search}%` });
    }
    if (query.slot) {
      qb.andWhere('meal.defaultSlot = :slot', { slot: query.slot });
    }
    if (query.tags?.length) {
      qb.andWhere('meal.tags && :tags', { tags: query.tags });
    }
    return qb.orderBy('meal.name', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Meal> {
    const meal = await this.mealsRepository.findOne({ where: { id } });
    if (!meal) {
      throw new NotFoundException('Meal not found');
    }
    return meal;
  }

  async create(dto: CreateMealDto, createdById: string): Promise<Meal> {
    const meal = this.mealsRepository.create({ ...dto, createdById });
    return this.mealsRepository.save(meal);
  }

  async update(id: string, dto: UpdateMealDto): Promise<Meal> {
    const meal = await this.findOne(id);
    Object.assign(meal, dto);
    return this.mealsRepository.save(meal);
  }

  async remove(id: string): Promise<void> {
    const meal = await this.findOne(id);
    await this.mealsRepository.remove(meal);
  }
}
