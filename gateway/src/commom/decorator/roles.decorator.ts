import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../user.role.enum';
export const ROLES_KEY = 'role';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);