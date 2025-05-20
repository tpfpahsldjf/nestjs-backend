import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'jwks' })
export class JwkSchemaClass extends Document {
  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true })
  privateKey: string;

  @Prop({ type: Object, required: true })
  publicJwk: Record<string, any>;

  @Prop({
    required: true,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  })
  expiresAt: Date;  //jwk 3개월 주기
}

export const JwkSchema = SchemaFactory.createForClass(JwkSchemaClass);

JwkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
