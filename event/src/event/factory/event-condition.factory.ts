import { Injectable } from '@nestjs/common';
import { EventType } from '../../common/enums/event-type.enum';
import { ConditionStrategy } from '../interfaces/condition-strategy.interface';
import { StrategyFactory } from './strategy-factory.base';
import { CONDITION_METADATA_KEY } from '../decorators/register.condition-strategy.decorator';

@Injectable()
export class EventConditionFactory extends StrategyFactory<
  EventType,
  ConditionStrategy
> {
  protected readonly metadataKey = CONDITION_METADATA_KEY;

}