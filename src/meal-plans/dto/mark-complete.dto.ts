import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class MarkCompleteDto {
  @ApiProperty()
  @IsBoolean()
  isCompleted: boolean;
}
