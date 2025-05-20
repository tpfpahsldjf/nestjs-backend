import { AccountRepository } from './account.repository.interface';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountData, AccountSchemaClass } from './schema/account.schema';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { ResultType, Result } from '../../common/types/result.type';
import { Immutable } from '../../common/types/immutable.type';
import { UserRole } from '../../common/enums/user.role.enum';

@Injectable()
export class MongooseAccountRepository
  implements AccountRepository<AccountData>
{
  readonly logger = new Logger(MongooseAccountRepository.name);
  constructor(
    @InjectModel(AccountSchemaClass.name)
    private readonly accountModel: Model<AccountSchemaClass>,
  ) {}

  async updateLastLoginAt(email: string): Promise<void> {
    try {
      await this.accountModel.updateOne(
        { email },
        { $set: { lastLoginAt: new Date() } },
      );
    } catch (err: any) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async findByEmail(
    email: string,
  ): Promise<ResultType<Immutable<AccountData>, ErrorCode>> {
    try {
      const accountRaw = await this.accountModel
        .findOne({
          email,
        })
        .lean()
        .exec();

      if (!accountRaw) return { isOk: false, error: ErrorCode.NOT_EXISTS };

      return Result.ok({
        ...accountRaw,
        id : accountRaw._id.toString()
      } as Immutable<AccountData>);
    } catch (err: any) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async createEmailAccount(
    email: string,
    password: string,
  ): Promise<ResultType<Immutable<AccountData>, ErrorCode>> {
    const date = new Date();
    try {
      const created = await this.accountModel.create({
        email,
        password,
        role: UserRole.USER,
        lastLoginAt: date,
      });

      const leanResult = created.toJSON();
      leanResult.id = created.id.toString();
      return Result.ok(leanResult as Immutable<AccountData>);
    } catch (err: any) {
      if (err.code === 11000) {
        return Result.fail(ErrorCode.ALREADY_EXISTS);
      }
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }
}