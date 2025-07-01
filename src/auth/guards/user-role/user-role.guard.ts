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
import { ValidRoles } from '../../models/roles.enum';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Retrieve the roles metadata from the route handler or class
    const validRoles = this.reflector.getAllAndOverride<ValidRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

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

    if (!user.roles || user.roles.length === 0)
      throw new ForbiddenException('User has no roles assigned.');

    for (const role of user.roles) {
      if (validRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User with roles [${user.roles.join(', ')}] is not allowed to access this resource.`,
    );
  }
}
