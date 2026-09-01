import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { MealSlot, MealTag } from '../../common/enums';

export class QueryMealsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MealSlot })
  @IsOptional()
  @IsEnum(MealSlot)
  slot?: MealSlot;

  @ApiPropertyOptional({ enum: MealTag, isArray: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? (value as unknown[]) : [value],
  )
  @IsArray()
  @IsEnum(MealTag, { each: true })
  tags?: MealTag[];
}
