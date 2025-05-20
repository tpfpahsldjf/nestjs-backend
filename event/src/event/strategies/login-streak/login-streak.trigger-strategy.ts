import { Injectable } from '@nestjs/common';
import { EventType } from '../../../common/enums/event-type.enum';
import { TriggerStrategy } from '../../interfaces/trigger-strategy.interface';
import { RegisterTriggerStrategy } from '../../decorators/register.trigger-strategy.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { LoginStreakSchemaClass } from '../../repository/schema/login-streak.schema';
import { Model } from 'mongoose';

@RegisterTriggerStrategy(EventType.LOGIN_STREAK)
@Injectable()
export class LoginStreakTriggerStrategy implements TriggerStrategy {
  constructor(
    @InjectModel(LoginStreakSchemaClass.name)
    private readonly loginStreakModel: Model<LoginStreakSchemaClass>,
  ) {}

  async isTriggered(
    userId: string,
    eventType: EventType,
    eventTag: string,
    score: number,
    meta?: Record<string, any>,
  ): Promise<boolean> {
    const now = new Date();

    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const updated = await this.loginStreakModel.findOneAndUpdate(
      {
        userId,
        type: eventType,
        tag: eventTag,
        lastLoginDate: { $gte: yesterday, $lt: today },
      },
      {
        $set: {
          lastLoginDate: now,
          meta,
        },
        $inc: { count: score },
      },
      {
        new: true,
        upsert: false,
      },
    );

    if (updated) return true;

    const exists = await this.loginStreakModel.exists({
      userId,
      type: eventType,
      tag: eventTag,
    });

    if (!exists) {
      await this.loginStreakModel.create({
        userId,
        type: eventType,
        tag: eventTag,
        lastLoginDate: now,
        count: score,
        meta,
      });
      return true;
    }

    return false;
  }
}
