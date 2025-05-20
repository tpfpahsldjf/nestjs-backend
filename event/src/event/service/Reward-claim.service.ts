import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventType } from '../../common/enums/event-type.enum';
import { RewardHistoryData } from '../repository/schema/reward-history.schema';
import { RewardClaimStatus } from '../../common/enums/reward-claim-status.enum';
import {
  REWARD_CLAIM_REPOSITORY,
  RewardClaimRepository,
} from '../repository/reward-claim.repository.interface';
import {
  EVENT_REPOSITORY,
  EventRepository,
} from '../repository/event.repository.interface';
import { EventConditionFactory } from '../factory/event-condition.factory';
import { EventData } from '../repository/schema/event.schema';
import { ErrorMessages } from '../../common/constants/error-messages';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { EventRewardFactory } from '../factory/event-reward-strategy.factory';

@Injectable()
export class RewardClaimService {
  private readonly logger = new Logger(RewardClaimService.name);
  constructor(
    @Inject(REWARD_CLAIM_REPOSITORY)
    private readonly rewardRepository: RewardClaimRepository<RewardHistoryData>,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository<EventData>,
    private readonly conditionFactory: EventConditionFactory,
    private readonly rewardFactory: EventRewardFactory,
  ) {}

  async claimReward(
    userId: string,
    eventType: EventType,
    eventTag: string,
  ): Promise<void> {
    const historyResult = await this.rewardRepository.findClaimByTypeAndTag(
      userId,
      eventType,
      eventTag,
    );

    if (
      historyResult.isOk &&
      historyResult.value.status === RewardClaimStatus.SUCCESS
    ) {
      throw new BadRequestException(
        ErrorMessages[ErrorCode.ALREADY_CLAIMED],
        ErrorCode.ALREADY_CLAIMED,
      );
    }

    const eventResult = await this.eventRepository.findEventByTypeAndTag(
      eventType,
      eventTag,
    );

    if (!eventResult.isOk) {
      throw new NotFoundException(
        ErrorMessages[ErrorCode.NOT_FOUND],
        ErrorCode.NOT_FOUND,
      );
    }

    const eventData = eventResult.value;
    const condition = this.conditionFactory.getStrategy(eventData.type);
    const isSatisfied = await condition.checkCondition(userId, eventData);

    if (!isSatisfied.isOk && isSatisfied.error === ErrorCode.NO_PROGRESS) {
      throw new BadRequestException(
        ErrorMessages[ErrorCode.NO_PROGRESS],
        ErrorCode.NO_PROGRESS,
      );
    }

    const claimResult = await this.rewardRepository.createIfNotExists(
      userId,
      eventData,
      isSatisfied.isOk ? RewardClaimStatus.PENDING : RewardClaimStatus.FAILED,
      isSatisfied.isOk ? undefined : 'Reward was denied due to unmet conditions.',
    );

    //조건에 맞지않을시 히스토리에 기록하지 않으려면 createIfNotExists 위로 이동
    if (!isSatisfied.isOk) {
      throw new BadRequestException(
        ErrorMessages[ErrorCode.CONDITION_NOT_MET],
        ErrorCode.CONDITION_NOT_MET,
      );
    }

    if (!claimResult.isOk) {
      if (claimResult.error !== ErrorCode.ALREADY_EXISTS) {
        throw new BadRequestException(
          ErrorMessages[claimResult.error],
          claimResult.error.toString(),
        );
      }
    }

    const rewardHistory = claimResult.isOk
      ? claimResult.value
      : historyResult.isOk
        ? historyResult.value
        : null;

    if (!rewardHistory) {
      this.logger.error(
        'Failed to resolve reward history from either creation or retrieval.',
        {
          userId,
          eventType,
          eventTag,
        },
      );

      throw new InternalServerErrorException(
        'Failed to issue the reward due to an internal error.',
      );
    }

    //유저 요청시 PENDING변경 운영측에서 수동으로 지급할 수 있으나
    //현 스펙에선 조건달성이된다면 바로 지급하는 구조로 개발
    if (
      rewardHistory.status === RewardClaimStatus.PENDING ||
      rewardHistory.status === RewardClaimStatus.FAILED
    ) {
      await this.ensureRewardIssued(userId, eventData);
    }
  }

  public async ensureRewardIssued(userId: string, eventData: EventData) {
    const reward = this.rewardFactory.getStrategy(eventData.type);

    const tasks = [
      {
        name: 'updateClaimStatus',
        fn: () =>
          this.rewardRepository.updateClaimStatus(
            userId,
            eventData.type,
            eventData.tag,
            RewardClaimStatus.SUCCESS,
          ),
      },
      {
        name: 'giveReward',
        fn: () => reward.giveReward(userId, eventData.rewards),
      },
    ];
    const results = await Promise.allSettled(tasks.map((t) => t.fn()));

    let hasError = false;
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        hasError = true;
        this.logger.error(`[${tasks[i].name}] failed`, result.reason);
      }
    });

    if (hasError) {
      throw new InternalServerErrorException(
        'Failed to issue the reward due to an internal error.',
      );
    }
  }

  async getRewardHistories(userId: string) {
    const result = await this.rewardRepository.findAllClaimsByUser(userId);

    if (!result.isOk) {
      throw new NotFoundException(
        ErrorMessages[ErrorCode.NOT_FOUND],
        ErrorCode.NOT_FOUND,
      );
    }

    return result.value;
  }
}
