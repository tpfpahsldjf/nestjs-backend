import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EventType } from '../../../common/enums/event-type.enum';
import { ConditionStrategy } from '../../interfaces/condition-strategy.interface';
import { RegisterConditionStrategy } from '../../decorators/register.condition-strategy.decorator';
import { ComparisonOperator } from '../../../common/enums/comparison-operator.enum';
import { EventData } from '../../repository/schema/event.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  LoginStreakData,
  LoginStreakSchemaClass,
} from '../../repository/schema/login-streak.schema';
import { Model } from 'mongoose';
import { Result, ResultType } from '../../../common/types/result.type';
import { ErrorCode } from '../../../common/enums/error-code.enum';

@RegisterConditionStrategy(EventType.LOGIN_STREAK)
@Injectable()
export class LoginStreakConditionStrategy implements ConditionStrategy {
  private readonly logger = new Logger(LoginStreakConditionStrategy.name);

  constructor(
    @InjectModel(LoginStreakSchemaClass.name)
    private readonly loginStreakModel: Model<LoginStreakSchemaClass>,
  ) {}

  async checkCondition(
    userId: string,
    event: EventData,
  ): Promise<ResultType<boolean, ErrorCode>> {
    const loginStreak = await this.loginStreakModel
      .findOne({
        userId,
        tag: event.tag,
      })
      .lean<LoginStreakData>()
      .exec();

    if (!loginStreak) {
      return Result.fail(ErrorCode.NO_PROGRESS);
    }

    const count = loginStreak.count;
    const threshold = event.threshold;

    const isMet = (() => {
      switch (event.comparisonOperator) {
        case ComparisonOperator.GreaterThan:
          return count > threshold;
        case ComparisonOperator.GreaterThanOrEqual:
          return count >= threshold;
        case ComparisonOperator.LessThan:
          return count < threshold;
        case ComparisonOperator.LessThanOrEqual:
          return count <= threshold;
        case ComparisonOperator.Equal:
          return count === threshold;
        default: {
          const message = `Invalid comparison operator: ${event.comparisonOperator as string}`;
          this.logger.error(message, {
            userId,
            tag: event.tag,
            count,
            threshold,
          });
          throw new InternalServerErrorException(message);
        }
      }
    })();

    return isMet ? Result.ok(true) : Result.fail(ErrorCode.CONDITION_NOT_MET);
  }
}
