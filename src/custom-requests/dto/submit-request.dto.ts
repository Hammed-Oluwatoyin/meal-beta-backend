import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  details: string;
}
