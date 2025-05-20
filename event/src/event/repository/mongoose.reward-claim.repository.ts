import { InjectModel } from '@nestjs/mongoose';
import { RewardClaimRepository } from './reward-claim.repository.interface';
import { Model } from 'mongoose';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  RewardHistoryData,
  RewardHistorySchemaClass,
} from './schema/reward-history.schema';
import { Result, ResultType } from '../../common/types/result.type';
import { Immutable, ImmutableList } from '../../common/types/immutable.type';
import { RewardClaimStatus } from '../../common/enums/reward-claim-status.enum';
import { TriggerSourceType } from '../../common/enums/trigger-source-type.enum';
import { EventData } from './schema/event.schema';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { EventType } from 'src/common/enums/event-type.enum';

@Injectable()
export class MongooseRewardClaimRepository
  implements RewardClaimRepository<RewardHistoryData>
{
  private readonly logger = new Logger(MongooseRewardClaimRepository.name);

  constructor(
    @InjectModel(RewardHistorySchemaClass.name)
    private readonly claimModel: Model<RewardHistorySchemaClass>,
  ) {}

  async findAll(): Promise<
    ResultType<ImmutableList<RewardHistoryData>, ErrorCode>
  > {
    const result = await this.claimModel
      .find()
      .lean<RewardHistoryData[]>()
      .exec();

    if (result.length < 1) return Result.fail(ErrorCode.NOT_EXISTS);

    return Result.ok(result as ImmutableList<RewardHistoryData>);
  }

  async createIfNotExists(
    userId: string,
    eventData: EventData,
    status: RewardClaimStatus = RewardClaimStatus.PENDING,
    failReason?: string,
  ): Promise<ResultType<Immutable<RewardHistoryData>, ErrorCode>> {
    try {
      const result = await this.claimModel.create({
        userId,
        eventSnapshot: eventData,
        requestedAt: new Date(),
        triggeredBy: eventData.rewardTriggerType,
        status,
        failReason,
      });

      return Result.ok(result as Immutable<RewardHistoryData>);
    } catch (err: any) {
      if (err.code === 11000) {
        return Result.fail(ErrorCode.ALREADY_EXISTS);
      }
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async findAllClaimsByUser(
    userId: string,
  ): Promise<ResultType<ImmutableList<RewardHistoryData>, ErrorCode>> {
    const result = await this.claimModel
      .find({ userId })
      .lean<RewardHistoryData[]>()
      .exec();

    if (result.length < 1) return Result.fail(ErrorCode.NOT_EXISTS);

    return Result.ok(result as ImmutableList<RewardHistoryData>);
  }

  async findClaimByTypeAndTag(
    userId: string,
    eventType: EventType,
    tag: string,
  ): Promise<ResultType<Readonly<RewardHistoryData>, ErrorCode>> {
    const result = await this.claimModel
      .findOne({
        userId,
        'eventSnapshot.type': eventType,
        'eventSnapshot.tag': tag,
      })
      .lean<RewardHistoryData>()
      .exec();

    if (!result) return Result.fail(ErrorCode.NOT_EXISTS);

    return Result.ok(result as Immutable<RewardHistoryData>);
  }

  async updateClaimStatus(
    userId: string,
    eventType: EventType,
    tag: string,
    status: RewardClaimStatus,
    failReason?: string,
  ): Promise<ResultType<Immutable<RewardHistoryData>, ErrorCode>> {
    const update: Partial<RewardHistoryData> = {
      status,
    };

    if (status === RewardClaimStatus.SUCCESS) {
      update.fulfilledAt = new Date();
      update.failReason = 'SUCCESS';
    }

    if (failReason) {
      update.failReason = failReason;
    }

    const result = await this.claimModel
      .findOneAndUpdate(
        { userId, 'eventSnapshot.type': eventType, 'eventSnapshot.tag': tag },
        { $set: update },
        { new: true },
      )
      .lean<RewardHistoryData>()
      .exec();

    if (!result) return Result.fail(ErrorCode.NOT_EXISTS);

    return Result.ok(result as Immutable<RewardHistoryData>);
  }
}
