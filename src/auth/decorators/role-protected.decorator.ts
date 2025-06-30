import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../models/roles.enum';

export const ROLES_KEY = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {
  return SetMetadata(ROLES_KEY, args);
};
