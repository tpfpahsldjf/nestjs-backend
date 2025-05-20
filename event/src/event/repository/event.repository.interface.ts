import { ResultType } from '../../common/types/result.type';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { Immutable, ImmutableList } from '../../common/types/immutable.type';
import { EventType } from '../../common/enums/event-type.enum';
import { EventData } from './schema/event.schema';

export interface EventRepository<T> {
  findEventById(id: string): Promise<ResultType<Immutable<T>, ErrorCode>>;

  getActiveEvents(): Promise<ResultType<ImmutableList<T>, ErrorCode>>;

  findActiveEventsByTypeAndTag(
    type: EventType,
    tag: string,
  ): Promise<ResultType<Immutable<EventData>, ErrorCode>>;

  findEventByTypeAndTag(
    type: EventType,
    tag: string,
  ): Promise<ResultType<Immutable<EventData>, ErrorCode>>;
}

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');
