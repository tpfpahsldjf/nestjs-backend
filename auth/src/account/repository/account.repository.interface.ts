import { ResultType } from '../../common/types/result.type';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { Immutable } from '../../common/types/immutable.type';

export interface AccountRepository<T> {
  findByEmail(email: string): Promise<ResultType<T, ErrorCode>>;

  updateLastLoginAt(email: string): Promise<void>;

  createEmailAccount(
    email: string,
    password: string,
  ): Promise<ResultType<Immutable<T>, ErrorCode>>;
}

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');