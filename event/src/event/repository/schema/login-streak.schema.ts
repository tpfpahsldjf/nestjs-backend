import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';

export type LoginStreakData = {
  _id: string;
  userId: string;
  type: string;
  tag: string;
  count: number;
  lastLoginDate: Date;
  meta: Record<string, any>;
};

@Schema({ collection: 'login_streaks' })
export class LoginStreakSchemaClass extends Document {
  declare id: ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  tag: string;

  @Prop({ required: true })
  count: number;

  @Prop({ required: true })
  lastLoginDate: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  meta: Record<string, any>;
}

export const LoginStreakSchema = SchemaFactory.createForClass(
  LoginStreakSchemaClass,
);

LoginStreakSchema.index({ userId: 1, type: 1, tag: 1 }, { unique: true });
