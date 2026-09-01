import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMealDto } from './create-meal.dto';

export class UpdateMealDto extends PartialType(CreateMealDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
