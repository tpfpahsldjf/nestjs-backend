import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RewardDto } from './reward.dto';
import { EventType } from '../../common/enums/event-type.enum';
import { ComparisonOperator } from '../../common/enums/comparison-operator.enum';

export class EventListDto {
  @ApiProperty({ example: '662c3c4bc20e6b3b5e3f54aa' })
  @Expose()
  readonly id: string;

  @ApiProperty({ enum: EventType, example: EventType.LOGIN_STREAK })
  @Expose()
  readonly type: string;

  @ApiProperty({ example: 'login-3days' })
  @Expose()
  readonly tag: string;

  @ApiProperty({ example: 3 })
  @Expose()
  readonly threshold: number;

  @ApiProperty({
    enum: ComparisonOperator,
    example: ComparisonOperator.GreaterThanOrEqual,
  })
  @Expose()
  readonly comparisonOperator: string;

  @ApiProperty({ type: [RewardDto] })
  @Expose()
  @Type(() => RewardDto)
  readonly rewards: RewardDto[];

  @ApiProperty()
  @Expose()
  readonly enabled: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  readonly startAt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  readonly endAt: string;
}