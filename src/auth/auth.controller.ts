import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetHeaders } from './decorators/get-headers.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRol } from './models/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('test-private-route')
  @UseGuards(AuthGuard('jwt'))
  testingPrivateRoute(
    @GetUser() user: User,
    @GetHeaders() headers: Headers,
    @GetHeaders('authorization') authToken: string,
  ) {
    return { message: 'This is a private route', user, headers, authToken };
  }

  @Get('test-private-route2')
  @RoleProtected(ValidRol.SUPER_USER, ValidRol.ADMIN)
  @UseGuards(AuthGuard('jwt'), UserRoleGuard)
  testingPrivateRoute2(@GetUser() user: User) {
    return { message: 'This is a private route 2', user };
  }
}
