import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  ActivityLevel,
  Gender,
  HealthGoal,
  PlanType,
} from '../../common/enums';

export class CreateOnboardingDto {
  @ApiProperty()
  @IsInt()
  @Min(13)
  @Max(120)
  age: number;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty()
  @IsNumber()
  @Min(50)
  @Max(272)
  heightCm: number;

  @ApiProperty()
  @IsNumber()
  @Min(20)
  @Max(400)
  weightKg: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(20)
  householdSize: number;

  @ApiProperty({ enum: HealthGoal, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(HealthGoal, { each: true })
  healthGoals: HealthGoal[];

  @ApiProperty({ enum: ActivityLevel })
  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lifestyleInfo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dailySchedule?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  foodPreferences: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  medicalConditions: string[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  budgetPerWeek: number;

  @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  planType: PlanType;
}
