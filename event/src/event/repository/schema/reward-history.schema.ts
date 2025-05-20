import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { TriggerSourceType } from '../../../common/enums/trigger-source-type.enum';
import { RewardClaimStatus } from '../../../common/enums/reward-claim-status.enum';
import { EventData } from './event.schema';

export type RewardHistoryData = {
  id: string;
  userId: string;
  eventSnapshot: EventData;
  requestedAt: Date;
  triggeredBy: TriggerSourceType;
  status: RewardClaimStatus;
  fulfilledAt?: Date;
  failReason?: string;
};

@Schema({ collection: 'reward_histories' })
export class RewardHistorySchemaClass extends Document {
  declare _id: ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: Object })
  eventSnapshot: EventData;

  @Prop({ required: true, type: Date })
  requestedAt: Date;

  @Prop({ required: true, enum: TriggerSourceType })
  triggeredBy: TriggerSourceType;

  @Prop({ required: true, enum: RewardClaimStatus })
  status: RewardClaimStatus;

  @Prop({ type: Date, default: null })
  fulfilledAt?: Date;

  @Prop()
  failReason?: string;
}

export const RewardHistorySchema = SchemaFactory.createForClass(
  RewardHistorySchemaClass,
);

RewardHistorySchema.index(
  {
    userId: 1,
    'eventSnapshot.type': 1,
    'eventSnapshot.tag': 1,
  },
  { unique: true },
);
