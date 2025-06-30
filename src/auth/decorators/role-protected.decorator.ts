import { SetMetadata } from '@nestjs/common';
import { ValidRol } from '../models/roles.enum';

export const ROLES_KEY = 'roles';

export const RoleProtected = (...args: ValidRol[]) => {
  return SetMetadata(ROLES_KEY, args);
};
