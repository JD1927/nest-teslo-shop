import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetHeaders = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): string | Headers => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const headers = request.headers;

    if (!headers) {
      throw new InternalServerErrorException(
        'Headers not found in request context.',
      );
    }

    // If data is provided, return the specific header
    if (data) return headers[data.toLowerCase()] as string;

    // Otherwise, return all headers
    return headers;
  },
);
