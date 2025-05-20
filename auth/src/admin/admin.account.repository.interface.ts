import { UserRole } from '../common/enums/user.role.enum';
import { ResultType } from '../common/types/result.type';
import { Immutable } from '../common/types/immutable.type';
import { ErrorCode } from '../common/enums/error-code.enum';

export interface AdminAccountRepository<T> {
  updateRole(
    id: string,
    role: UserRole,
  ): Promise<ResultType<Immutable<T>, ErrorCode>>;
}

export const ADMIN_ACCOUNT_REPOSITORY = Symbol('ADMIN_ACCOUNT_REPOSITORY');