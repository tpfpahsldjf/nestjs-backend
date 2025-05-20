import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { EventType } from '../../../common/enums/event-type.enum';
import { ComparisonOperator } from '../../../common/enums/comparison-operator.enum';
import { TriggerSourceType } from '../../../common/enums/trigger-source-type.enum';
import { Reward } from './reward.schema';

export type EventData = {
  id: string;
  type: EventType;
  tag: string;
  threshold: number;
  comparisonOperator: ComparisonOperator;
  rewardTriggerType: TriggerSourceType;
  rewards: Reward[];
  enabled: boolean;
  startAt: Date;
  endAt: Date;
};

@Schema({ collection: 'events' })
export class EventSchemaClass extends Document {
  declare _id: ObjectId;

  @Prop({ required: true })
  type: EventType;

  @Prop({ required: true })
  tag: string;

  @Prop({ required: true })
  threshold: number;

  @Prop({ required: true, enum: ComparisonOperator })
  comparisonOperator: ComparisonOperator;

  @Prop({
    required: true,
    enum: TriggerSourceType,
    default: TriggerSourceType.AUTO,
  })
  rewardTriggerType: TriggerSourceType;

  @Prop({ type: [Reward], required: true })
  rewards: Reward[];

  @Prop({ required: true })
  enabled: boolean;

  @Prop({ required: true, type: Date })
  startAt: Date;

  @Prop({ required: true, type: Date })
  endAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(EventSchemaClass);

EventSchema.index({ enabled: 1, startAt: 1, endAt: 1 });
EventSchema.index({ type: 1, tag: 1, enabled: 1, startAt: 1, endAt: 1 });
EventSchema.index({ type: 1, tag: 1 }, { unique: true });
