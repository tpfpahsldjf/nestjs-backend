import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventConditionFactory } from '../factory/event-condition.factory';
import {
  EVENT_REPOSITORY,
  EventRepository,
} from '../repository/event.repository.interface';
import { EventData } from '../repository/schema/event.schema';
import { ErrorMessages } from '../../common/constants/error-messages';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { ImmutableList } from '../../common/types/immutable.type';
import { EventTriggerFactory } from '../factory/event-trigger.factory';
import { EventType } from '../../common/enums/event-type.enum';
import { TriggerSourceType } from '../../common/enums/trigger-source-type.enum';
import {
  REWARD_CLAIM_REPOSITORY,
  RewardClaimRepository,
} from '../repository/reward-claim.repository.interface';
import { RewardHistoryData } from '../repository/schema/reward-history.schema';
import { RewardClaimService } from './Reward-claim.service';
import { CacheUtil } from '../../common/utils/cache.util';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(
    private readonly rewardClaimService: RewardClaimService,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository<EventData>,
    @Inject(REWARD_CLAIM_REPOSITORY)
    private readonly rewardRepository: RewardClaimRepository<RewardHistoryData>,
    private readonly triggerFactory: EventTriggerFactory,
    private readonly conditionFactory: EventConditionFactory,
    private readonly cacheUtil: CacheUtil,
  ) {}

  public async execute(
    userId: string,
    eventType: EventType,
    eventTag: string,
    score: number,
    meta: Record<string, any>,
  ): Promise<void> {
    // 이벤트 타입 단위로 일괄 처리하면 성능상 이점은 크지만,
    // 각 이벤트마다 조건/보상 로직이 상이하여 유지보수성과 확장성이 크게 저하됨.
    //
    // 개별 이벤트 로직은 단건 처리로 분리하고,
    // 이후 병렬 호출 등 외부에서 최적화할 수 있도록 설계함.

    const activeEventResult =
      await this.eventRepository.findActiveEventsByTypeAndTag(
        eventType,
        eventTag,
      );

    if (!activeEventResult.isOk) {
      this.logger.warn('No active events found for triggered user.', {
        userId,
        eventType,
        eventTag,
        score,
        meta,
      });

      throw new NotFoundException(
        ErrorMessages[ErrorCode.NOT_FOUND],
        ErrorCode.NOT_FOUND,
      );
    }
    const eventData = activeEventResult.value;
    const trigger = this.triggerFactory.getStrategy(eventData.type);

    const isTriggered = await trigger.isTriggered(
      userId,
      eventData.type,
      eventData.tag,
      score,
      meta,
    );

    if (!isTriggered) return;

    const condition = this.conditionFactory.getStrategy(eventData.type);
    const isSatisfied = await condition.checkCondition(userId, eventData);

    if (!isSatisfied) return;

    if (eventData.rewardTriggerType === TriggerSourceType.AUTO) {
      const claimResult = await this.rewardRepository.createIfNotExists(
        userId,
        eventData,
      );

      if (!claimResult.isOk) {
        throw new ConflictException(
          ErrorMessages[ErrorCode.ALREADY_CLAIMED],
          ErrorCode.ALREADY_CLAIMED,
        );
      }

      await this.rewardClaimService.ensureRewardIssued(userId, eventData);
    }
  }

  public async getActiveEvents(): Promise<ImmutableList<EventData>> {
    return this.cacheUtil.getOrSet('events:active', 5, async () => {
      const result = await this.eventRepository.getActiveEvents();

      if (!result.isOk) {
        throw new NotFoundException(
          ErrorMessages[ErrorCode.NOT_FOUND],
          ErrorCode.NOT_FOUND,
        );
      }

      return result.value;
    });
  }
}
