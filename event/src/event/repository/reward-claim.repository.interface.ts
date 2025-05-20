import { Immutable, ImmutableList } from '../../common/types/immutable.type';
import { ResultType } from '../../common/types/result.type';
import { EventData } from './schema/event.schema';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { EventType } from '../../common/enums/event-type.enum';
import { RewardClaimStatus } from '../../common/enums/reward-claim-status.enum';

export interface RewardClaimRepository<T> {
  createIfNotExists(
    userId: string,
    eventData: EventData,
    status?: RewardClaimStatus,
    failReason?: string,
  ): Promise<ResultType<Immutable<T>, ErrorCode>>;

  findAllClaimsByUser(
    userId: string,
  ): Promise<ResultType<ImmutableList<T>, ErrorCode>>;

  findClaimByTypeAndTag(
    userId: string,
    eventType: EventType,
    tag: string,
  ): Promise<ResultType<Immutable<T>, ErrorCode>>;

  updateClaimStatus(
    userId: string,
    eventType: EventType,
    tag: string,
    status: RewardClaimStatus,
    failReason?: string
  ): Promise<ResultType<Immutable<T>, ErrorCode>>;
}

export const REWARD_CLAIM_REPOSITORY = Symbol('REWARD_CLAIM_REPOSITORY');