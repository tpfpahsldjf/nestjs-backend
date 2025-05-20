import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { UserRole } from '../user.role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly cache = new Map<Function, UserRole[]>();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();

    let requiredRoles = this.cache.get(handler);
    if (!requiredRoles) {
      requiredRoles = this.reflector.getAllAndMerge<UserRole[]>(ROLES_KEY, [
        handler,
        context.getClass(),
      ]) ?? [];
      this.cache.set(handler, requiredRoles);
    }

    if (requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const userRoles = Array.isArray(user?.roles)
      ? user.roles
      : user?.role
        ? [user.role]
        : [];

    return userRoles.some((role: UserRole) =>
      requiredRoles.includes(role)
    );
  }
}