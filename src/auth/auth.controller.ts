import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetHeaders } from './decorators/get-headers.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './models/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: User,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  @HttpCode(200) // Override default 201 status code for login
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('check-status')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({
    status: 200,
    description: 'Returns current user authentication status',
    type: User,
  })
  @Auth(ValidRoles.USER)
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('test-private-route')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Test private route with JWT AuthGuard' })
  @ApiResponse({ status: 200, description: 'Access granted to private route' })
  @UseGuards(AuthGuard('jwt'))
  testingPrivateRoute(
    @GetUser() user: User,
    @GetHeaders() headers: Headers,
    @GetHeaders('authorization') authToken: string,
  ) {
    return { message: 'This is a private route', user, headers, authToken };
  }

  @Get('test-private-route2')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Test private route with role protection' })
  @ApiResponse({
    status: 200,
    description: 'Access granted to private route 2',
  })
  @RoleProtected(ValidRoles.SUPER_USER, ValidRoles.ADMIN)
  @UseGuards(AuthGuard('jwt'), UserRoleGuard)
  testingPrivateRoute2(@GetUser() user: User) {
    return { message: 'This is a private route 2', user };
  }

  @Get('test-private-route3')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Test private route with Auth decorator' })
  @ApiResponse({
    status: 200,
    description: 'Access granted to private route 3',
  })
  @Auth(ValidRoles.ADMIN)
  testingPrivateRoute3(@GetUser() user: User) {
    return { message: 'This is a private route 3', user };
  }
}
