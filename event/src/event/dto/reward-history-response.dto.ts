import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { EventType } from '../../common/enums/event-type.enum';
import { RewardClaimStatus } from '../../common/enums/reward-claim-status.enum';
import { Reward } from '../repository/schema/reward.schema';

export class RewardHistoryResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.eventId)
  eventId: string;

  @ApiProperty({ enum: EventType })
  @Expose()
  @Transform(({ obj }) => obj.eventSnapshot.type)
  type: EventType;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.eventSnapshot.tag)
  tag: string;

  @ApiProperty({ type: [Reward] })
  @Expose()
  @Transform(({ obj }) => obj.eventSnapshot.rewards)
  rewards: Reward[];

  @ApiProperty({ enum: RewardClaimStatus })
  @Expose()
  status: RewardClaimStatus;

  @ApiProperty()
  @Expose()
  requestedAt: Date;

  @ApiProperty()
  @Expose()
  fulfilledAt?: Date;

  @ApiProperty({ required: false })
  @Expose()
  failReason?: string;
}