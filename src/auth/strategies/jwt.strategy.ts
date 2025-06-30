import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { User } from '../entities/user.entity';
import { IJwtPayload } from '../models/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret)
      throw new Error('JWT_SECRET is not defined in environment variables.');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: IJwtPayload): Promise<User> {
    const { uid } = payload;
    console.log('🚀 ~ JwtStrategy ~ validate ~ payload:', payload);

    const user = await this.authService.findUserById(uid);

    if (!user) throw new UnauthorizedException('Invalid token.');

    if (!user.isActive)
      throw new UnauthorizedException(
        'User is inactive. Check with the administrator.',
      );

    return user;
  }
}
