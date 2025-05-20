import { EventType } from '../../common/enums/event-type.enum';

export interface TriggerStrategy {
  isTriggered(
    userId: string,
    eventType: EventType,
    eventTag: string,
    score: number,
    meta?: Record<string, any>,
  ): Promise<boolean>;
}
