import { SetMetadata } from '@nestjs/common';
import { EventType } from '../../common/enums/event-type.enum';


export const REWARD_METADATA_KEY = 'event:reward-strategy';

export const RegisterRewardStrategy
  = (eventType: EventType): ClassDecorator =>
  SetMetadata(REWARD_METADATA_KEY, eventType);