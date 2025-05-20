import { Injectable } from '@nestjs/common';
import { StrategyFactory } from './strategy-factory.base';
import { EventType } from '../../common/enums/event-type.enum';
import { RewardStrategy } from '../interfaces/reward-strategy.interface';
import { REWARD_METADATA_KEY } from '../decorators/register.reward-strategy.decorator';

@Injectable()
export class EventRewardFactory extends StrategyFactory<
  EventType,
  RewardStrategy
> {
  protected readonly metadataKey = REWARD_METADATA_KEY;
}