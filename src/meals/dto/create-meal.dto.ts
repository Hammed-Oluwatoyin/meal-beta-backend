import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { MealSlot, MealTag } from '../../common/enums';
import { MealIngredientDto } from './meal-ingredient.dto';

export class CreateMealDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [MealIngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealIngredientDto)
  ingredients: MealIngredientDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  prepSteps: string[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  proteinG: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  carbsG: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  fatG: number;

  @ApiProperty({ enum: MealTag, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(MealTag, { each: true })
  tags?: MealTag[];

  @ApiProperty({ enum: MealSlot, required: false })
  @IsOptional()
  @IsEnum(MealSlot)
  defaultSlot?: MealSlot;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  costEstimatePerServing: number;
}
