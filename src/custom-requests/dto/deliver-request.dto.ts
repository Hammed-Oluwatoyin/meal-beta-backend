import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { AddPlanEntryDto } from '../../meal-plans/dto/add-plan-entry.dto';

export class DeliverRequestDto {
  @ApiProperty()
  @IsDateString()
  weekStartDate: string;

  @ApiProperty({ type: [AddPlanEntryDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddPlanEntryDto)
  entries: AddPlanEntryDto[];
}
