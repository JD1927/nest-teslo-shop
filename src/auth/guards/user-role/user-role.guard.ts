import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../decorators/role-protected.decorator';
import { IRequestWithUser } from '../../models/request-with-user.interface';
import { ValidRol } from '../../models/roles.enum';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('🚀 ~ UserRoleGuard:', UserRoleGuard.name);

    const validRoles = this.reflector.get<ValidRol[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!validRoles) return true;

    if (validRoles.length === 0) {
      throw new InternalServerErrorException(
        'No roles metadata found for this route.',
      );
    }

    const request = context.switchToHttp().getRequest<IRequestWithUser>();

    const user = request.user;

    if (!user)
      throw new InternalServerErrorException(
        'User not found in request context.',
      );

    console.log('🚀 ~ UserRoleGuard ~ user:', user.roles);

    for (const role of user.roles) {
      if (validRoles.includes(role as ValidRol)) return true;
    }

    throw new ForbiddenException(
      `User with roles [${user.roles.join(', ')}] is not allowed to access this resource.`,
    );
  }
}
