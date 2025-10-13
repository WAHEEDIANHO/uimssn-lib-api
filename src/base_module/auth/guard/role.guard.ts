import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role.decorator';
import { RoleEnum } from '../../user/enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {

  constructor(
    private reflector: Reflector,
    private logger: Logger
  ) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const requiredRole = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRole) return true;
    this.logger.log(user)
    return requiredRole.some((role) => user.role?.includes(role));
  }
}