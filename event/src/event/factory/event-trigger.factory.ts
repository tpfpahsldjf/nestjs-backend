import { Injectable } from '@nestjs/common';
import { StrategyFactory } from './strategy-factory.base';
import { EventType } from '../../common/enums/event-type.enum';
import { TriggerStrategy } from '../interfaces/trigger-strategy.interface';
import { TRIGGER_METADATA_KEY } from '../decorators/register.trigger-strategy.decorator';

@Injectable()
export class EventTriggerFactory extends StrategyFactory<
  EventType,
  TriggerStrategy
> {
  protected readonly metadataKey = TRIGGER_METADATA_KEY;
}