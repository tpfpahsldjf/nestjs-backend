import { SetMetadata } from '@nestjs/common';
import { EventType } from '../../common/enums/event-type.enum';


export const CONDITION_METADATA_KEY = 'event:condition-strategy';

export const RegisterConditionStrategy
  = (eventType: EventType): ClassDecorator =>
  SetMetadata(CONDITION_METADATA_KEY, eventType);