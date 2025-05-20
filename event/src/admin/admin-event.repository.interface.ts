import { EventType } from '../common/enums/event-type.enum';
import { ResultType } from '../common/types/result.type';
import { ErrorCode } from '../common/enums/error-code.enum';
import { Reward } from '../event/repository/schema/reward.schema';
import { EventData } from '../event/repository/schema/event.schema';
import { ImmutableList } from '../common/types/immutable.type';
import { RewardHistoryData } from '../event/repository/schema/reward-history.schema';

export interface AdminEventRepository {
  getEvents(): Promise<ResultType<ImmutableList<EventData>, ErrorCode>>;

  createEvent(event: EventData): Promise<ResultType<boolean, ErrorCode>>;

  findAllClaims(): Promise<
    ResultType<ImmutableList<RewardHistoryData>, ErrorCode>
  >;

  findClaimsByUser(
    userId: string,
  ): Promise<ResultType<ImmutableList<RewardHistoryData>, ErrorCode>>;

  findClaimByType(
    userId: string,
    eventType: EventType,
  ): Promise<ResultType<ImmutableList<RewardHistoryData>, ErrorCode>>;

  addRewards(
    type: EventType,
    tag: string,
    rewards: Reward[],
  ): Promise<ResultType<boolean, ErrorCode>>;

  RemoveRewards(
    type: EventType,
    tag: string,
    rewards: Reward[],
  ): Promise<ResultType<boolean, ErrorCode>>;
}

export const ADMIN_EVENT_REPOSITORY = Symbol('ADMIN_EVENT_REPOSITORY');
