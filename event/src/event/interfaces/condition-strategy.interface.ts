import { EventData } from '../repository/schema/event.schema';
import { ResultType } from '../../common/types/result.type';
import { ErrorCode } from '../../common/enums/error-code.enum';
export interface ConditionStrategy {
  checkCondition(
    userId: string,
    event: EventData,
  ): Promise<ResultType<boolean, ErrorCode>>;
}
