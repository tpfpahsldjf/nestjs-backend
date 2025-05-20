import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AdminEventRepository } from './admin-event.repository.interface';
import { EventType } from '../common/enums/event-type.enum';
import { ErrorCode } from '../common/enums/error-code.enum';
import { Result, ResultType } from '../common/types/result.type';
import {
  EventData,
  EventSchemaClass,
} from '../event/repository/schema/event.schema';
import { Reward } from '../event/repository/schema/reward.schema';
import { ImmutableList } from '../common/types/immutable.type';
import {
  RewardHistoryData,
  RewardHistorySchemaClass,
} from '../event/repository/schema/reward-history.schema';

@Injectable()
export class MongooseAdminEventRepository implements AdminEventRepository
{
  readonly logger = new Logger(MongooseAdminEventRepository.name);
  constructor(
    @InjectModel(EventSchemaClass.name)
    private readonly eventModel: Model<EventSchemaClass>,
    @InjectModel(RewardHistorySchemaClass.name)
    private readonly rewardHistoryModel: Model<RewardHistorySchemaClass>,
  ) {}

  async findAllClaims(): Promise<
    ResultType<ImmutableList<RewardHistoryData>, ErrorCode>
  > {
    try {
      const claims = await this.rewardHistoryModel.find().lean<RewardHistoryData[]>().exec();
      if (!claims.length) return Result.fail(ErrorCode.NOT_EXISTS);
      return Result.ok(claims as ImmutableList<RewardHistoryData>);
    } catch (err) {
      this.logger.error('findAllClaims failed', err);
      throw new InternalServerErrorException();
    }
  }

  async findClaimsByUser(
    userId: string,
  ): Promise<ResultType<ImmutableList<RewardHistoryData>, ErrorCode>> {
    try {
      const claims = await this.rewardHistoryModel
        .find({ userId })
        .lean<RewardHistoryData[]>()
        .exec();
      if (!claims.length) return Result.fail(ErrorCode.NOT_EXISTS);
      return Result.ok(claims);
    } catch (err) {
      this.logger.error('findClaimsByUser failed', err);
      throw new InternalServerErrorException();
    }
  }

  async findClaimByType(
    userId: string,
    eventType: EventType,
  ): Promise<ResultType<ImmutableList<RewardHistoryData>, ErrorCode>> {
    try {
      const claims = await this.rewardHistoryModel
        .find({
          userId,
          'eventSnapshot.type': eventType,
        })
        .lean<RewardHistoryData[]>()
        .exec();

      if (!claims.length) return Result.fail(ErrorCode.NOT_EXISTS);
      return Result.ok(claims);
    } catch (err) {
      this.logger.error('findClaimByTypeAndTag failed', err);
      throw new InternalServerErrorException();
    }
  }

  async getEvents(): Promise<ResultType<ImmutableList<EventData>, ErrorCode>> {
    const events = await this.eventModel.find().lean<EventData[]>().exec();

    if (!events || events.length < 1) return Result.fail(ErrorCode.NOT_EXISTS);

    return Result.ok(events as ImmutableList<EventData>);
  }

  async createEvent(event: EventData): Promise<ResultType<boolean, ErrorCode>> {
    try {
      await this.eventModel.collection.insertOne(event);

      return Result.ok(true);
    } catch (err: any) {
      if (err.code === 11000) {
        return Result.fail(ErrorCode.ALREADY_EXISTS);
      }
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async addRewards(
    type: EventType,
    tag: string,
    rewards: Reward[],
  ): Promise<ResultType<boolean, ErrorCode>> {
    try {
      const event = await this.eventModel.findOne({ type, tag }).exec();

      if (!event) return Result.fail(ErrorCode.NOT_FOUND);

      const rewardIndexMap = new Map<string, number>();

      event.rewards.forEach((reward, index) => {
        rewardIndexMap.set(reward.itemId, index);
      });

      for (const r of rewards) {
        if (r.amount <= 0) continue;
        const idx = rewardIndexMap.get(r.itemId);

        if (idx !== undefined) {
          event.rewards[idx].amount += r.amount;
        } else {
          rewardIndexMap.set(r.itemId, event.rewards.length);
          event.rewards.push(r);
        }
      }

      event.markModified('rewards');
      await event.save();

      return Result.ok(true);
    } catch (err) {
      this.logger.error('addRewards failed', err);
      throw new InternalServerErrorException();
    }
  }
  async RemoveRewards(
    type: EventType,
    tag: string,
    rewards: Reward[],
  ): Promise<ResultType<boolean, ErrorCode>> {
    try {
      const event = await this.eventModel.findOne({ type, tag }).exec();
      if (!event) return Result.fail(ErrorCode.NOT_FOUND);

      const targetItemIds = new Set(rewards.map((r) => r.itemId));
      const originalLength = event.rewards.length;

      event.rewards = event.rewards.filter((r) => !targetItemIds.has(r.itemId));

      const removedCount = originalLength - event.rewards.length;
      if (removedCount === 0) {
        this.logger.warn(
          `No rewards matched for removal: eventType=${event.type},eventTag=${event.tag}, itemIds=[${[...targetItemIds].join(', ')}]`,
        );
        return Result.ok(false);
      }

      await event.save();
      return Result.ok(true);
    } catch (err) {
      this.logger.error('removeRewards failed', err);
      throw new InternalServerErrorException();
    }
  }
}
