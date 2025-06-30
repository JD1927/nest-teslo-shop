import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

interface RequestWithUser extends Request {
  user?: User;
}

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user)
      throw new InternalServerErrorException(
        'User not found in request context.',
      );

    // If data is provided, return the specific property from the user object
    if (data) return user[data];

    // Otherwise, return the entire user object
    return user;
  },
);
