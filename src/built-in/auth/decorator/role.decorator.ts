import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';
import { RoleEnum } from '../../user/enums/role.enum';


export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[])  => SetMetadata(ROLES_KEY, roles)