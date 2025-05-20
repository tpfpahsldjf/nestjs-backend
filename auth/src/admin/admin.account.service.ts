import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  ADMIN_ACCOUNT_REPOSITORY,
  AdminAccountRepository,
} from './admin.account.repository.interface';
import { UserRole } from '../common/enums/user.role.enum';
import { ErrorMessages } from '../common/constants/error-messages';

@Injectable()
export class AdminAccountService {
  private readonly logger = new Logger(AdminAccountService.name);
  constructor(
    @Inject(ADMIN_ACCOUNT_REPOSITORY)
    private readonly repository: AdminAccountRepository<any>,
  ) {}

  async updateRole(
    adminId: string,
    targetUserId: string,
    role: UserRole,
  ): Promise<void> {
    this.logger.log(`try [RoleUpdate] ${adminId} → ${targetUserId} = ${role}`);
    const result = await this.repository.updateRole(targetUserId, role);

    if(!result.isOk) {
      throw new BadRequestException(
        ErrorMessages[result.error],
        result.error.toString(),
      );
    }
  }
}