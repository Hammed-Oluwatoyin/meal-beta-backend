import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsUUID, Max, Min } from 'class-validator';
import { MealSlot } from '../../common/enums';

export class AddPlanEntryDto {
  @ApiProperty()
  @IsUUID()
  mealId: string;

  @ApiProperty({
    minimum: 0,
    maximum: 6,
    description: '0 = Monday .. 6 = Sunday',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ enum: MealSlot })
  @IsEnum(MealSlot)
  slot: MealSlot;
}
