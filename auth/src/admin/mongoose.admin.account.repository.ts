import { AdminAccountRepository } from './admin.account.repository.interface';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AccountSchemaClass } from '../account/repository/schema/account.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from '../common/enums/user.role.enum';
import { Result, ResultType } from '../common/types/result.type';
import { ErrorCode } from '../common/enums/error-code.enum';
import { Immutable } from '../common/types/immutable.type';

@Injectable()
export class MongooseAdminAccountRepository
  implements AdminAccountRepository<boolean>
{
  readonly logger = new Logger(MongooseAdminAccountRepository.name);

  constructor(
    @InjectModel(AccountSchemaClass.name)
    private readonly adminModel: Model<AccountSchemaClass>,
  ) {}

  async updateRole(
    id: string,
    role: UserRole,
  ): Promise<ResultType<Immutable<boolean>, ErrorCode>> {
    try {
      const account = await this.adminModel.findById(id).exec();
      if (!account) {
        return Result.fail(ErrorCode.NOT_FOUND);
      }

      account.role = role;
      await account.save();

      return Result.ok(true);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }
}
