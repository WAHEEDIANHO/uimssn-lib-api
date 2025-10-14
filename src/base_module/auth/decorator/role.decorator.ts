import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '@uimssn/base_module/user/enums/role.enum';


export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[])  => SetMetadata(ROLES_KEY, roles)