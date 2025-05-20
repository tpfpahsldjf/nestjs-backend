import { Prop } from '@nestjs/mongoose';

export class Reward {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  amount: number;
}