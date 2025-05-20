import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../common/enums/event-type.enum';
import { ComparisonOperator } from '../../common/enums/comparison-operator.enum';
import { TriggerSourceType } from '../../common/enums/trigger-source-type.enum';
import { RewardDto } from '../../event/dto/reward.dto';
export class CreateEventDto {
  @ApiProperty()
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty()
  @IsString()
  tag: string;

  @ApiProperty()
  @IsNumber()
  threshold: number;

  @ApiProperty()
  @IsEnum(ComparisonOperator)
  comparisonOperator: ComparisonOperator;

  @ApiProperty({ enum: TriggerSourceType, default: TriggerSourceType.AUTO })
  @IsEnum(TriggerSourceType)
  rewardTriggerType: TriggerSourceType;

  @ApiProperty({ type: [RewardDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardDto)
  rewards: RewardDto[];

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @Type(() => Date)
  startAt: Date;

  @ApiProperty()
  @Type(() => Date)
  endAt: Date;
}