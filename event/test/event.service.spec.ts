import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '../src/event/service/event.service';
import { EventTriggerFactory } from '../src/event/factory/event-trigger.factory';
import { EventConditionFactory } from '../src/event/factory/event-condition.factory';
import { EVENT_REPOSITORY } from '../src/event/repository/event.repository.interface';
import { EventType } from '../src/common/enums/event-type.enum';
import { ComparisonOperator } from '../src/common/enums/comparison-operator.enum';
import { TriggerSourceType } from '../src/common/enums/trigger-source-type.enum';
import { Result } from '../src/common/types/result.type';
import { EventData } from '../src/event/repository/schema/event.schema';
import { REWARD_CLAIM_REPOSITORY } from '../src/event/repository/reward-claim.repository.interface';
import { RewardClaimService } from '../src/event/service/Reward-claim.service';
import { CacheUtil } from '../src/common/utils/cache.util';


describe('EventService', () => {
  let service: EventService;

  const mockEventData: EventData = {
    id: 'mockId',
    type: EventType.LOGIN_STREAK,
    tag: 'daily',
    threshold: 3,
    comparisonOperator: ComparisonOperator.GreaterThanOrEqual,
    rewardTriggerType: TriggerSourceType.AUTO,
    rewards: [],
    enabled: true,
    startAt: new Date(Date.now() - 1000),
    endAt: new Date(Date.now() + 1000),
  };

  const mockEventRepository = {
    findActiveEventsByTypeAndTag: jest.fn().mockResolvedValue(Result.ok(mockEventData)),
  };

  const mockRewardRepository = {
    createIfNotExists: jest.fn().mockResolvedValue(Result.ok(true)),
  };

  const mockTriggerStrategy = {
    isTriggered: jest.fn().mockResolvedValue(true),
  };

  const mockConditionStrategy = {
    checkCondition: jest.fn().mockResolvedValue(true),
  };

  const mockTriggerFactory = {
    getStrategy: jest.fn().mockReturnValue(mockTriggerStrategy),
  };

  const mockConditionFactory = {
    getStrategy: jest.fn().mockReturnValue(mockConditionStrategy),
  };

  const mockRewardClaimService = {
    ensureRewardIssued: jest.fn().mockResolvedValue(undefined),
  };

  const mockCacheUtil = {
    getOrSet: jest.fn().mockImplementation(async (_key, _ttl, fetcher) => fetcher()),
    invalidate: jest.fn().mockResolvedValue(undefined),
    clearAll: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EVENT_REPOSITORY, useValue: mockEventRepository },
        { provide: REWARD_CLAIM_REPOSITORY, useValue: mockRewardRepository },
        { provide: EventTriggerFactory, useValue: mockTriggerFactory },
        { provide: EventConditionFactory, useValue: mockConditionFactory },
        { provide: RewardClaimService, useValue: mockRewardClaimService },
        { provide: CacheUtil, useValue: mockCacheUtil },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('should process and claim reward if triggered and condition is met', async () => {
    await expect(
      service.execute('user123', EventType.LOGIN_STREAK, 'daily', 1, {}),
    ).resolves.toBeUndefined();

    expect(mockEventRepository.findActiveEventsByTypeAndTag).toHaveBeenCalled();
    expect(mockTriggerFactory.getStrategy).toHaveBeenCalledWith(EventType.LOGIN_STREAK);
    expect(mockTriggerStrategy.isTriggered).toHaveBeenCalled();
    expect(mockConditionFactory.getStrategy).toHaveBeenCalledWith(EventType.LOGIN_STREAK);
    expect(mockConditionStrategy.checkCondition).toHaveBeenCalled();
    expect(mockRewardRepository.createIfNotExists).toHaveBeenCalled();
    expect(mockRewardClaimService.ensureRewardIssued).toHaveBeenCalled();
  });
});