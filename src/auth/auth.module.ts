import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            // Token expiration time
            expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') || '1h',
          },
        };
      },
    }),
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME }, // Token expiration time
    // }),
  ],
  exports: [AuthService, TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
