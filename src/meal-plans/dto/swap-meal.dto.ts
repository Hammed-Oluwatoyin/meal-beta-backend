import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SwapMealDto {
  @ApiProperty()
  @IsUUID()
  mealId: string;
}
