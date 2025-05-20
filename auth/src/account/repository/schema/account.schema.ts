import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { UserRole } from '../../../common/enums/user.role.enum';

export type AccountData = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
};

@Schema({
  collection: 'accounts',
  timestamps: { createdAt: true, updatedAt: false },
})
export class AccountSchemaClass extends Document {
  declare _id: ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: UserRole.USER, enum: Object.values(UserRole) })
  role: UserRole;

  @Prop()
  lastLoginAt?: Date;

  createdAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(AccountSchemaClass);
