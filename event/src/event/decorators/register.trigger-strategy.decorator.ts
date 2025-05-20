import { SetMetadata } from '@nestjs/common';
import { EventType } from '../../common/enums/event-type.enum';


export const TRIGGER_METADATA_KEY = 'event:trigger-strategy';

export const RegisterTriggerStrategy
  = (eventType: EventType): ClassDecorator =>
  SetMetadata(TRIGGER_METADATA_KEY, eventType);