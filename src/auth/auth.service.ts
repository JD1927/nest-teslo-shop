import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, hashSync } from 'bcrypt';
import { Repository } from 'typeorm';
import { SeedUser } from '../seed/data/seed.data';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { IJwtPayload } from './models/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: this.hashUserPassword(password), // Hash the password
      });

      await this.userRepository.save(user);

      this.logger.log(`User ${user.email} created successfully.`);
      // Exclude password from the response
      return {
        ...user,
        password: undefined,
        token: this.getJwtToken({ email: userData.email, uid: user.id }),
      };
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true, // Include id for JWT payload
        email: true,
        password: true,
        isActive: true,
        roles: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials.');

    if (!compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials.');

    if (!user.isActive)
      throw new UnauthorizedException(
        'User is inactive. Please contact support.',
      );

    if (!user.roles || user.roles.length === 0)
      throw new UnauthorizedException(
        'User has no roles assigned. Please contact support.',
      );

    this.logger.log(`User ${email} logged in successfully.`);

    return { email, token: this.getJwtToken({ email, uid: user.id }) };
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ email: user.email, uid: user.id }),
    };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findUserById(uid: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: uid },
    });
  }

  async deleteAllUsers() {
    try {
      const queryBuilder = this.userRepository.createQueryBuilder('users');
      const result = await queryBuilder.delete().where({}).execute();
      this.logger.log(`Deleted ${result.affected} users.`);
      return result;
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  createSeedUser(seedUser: SeedUser) {
    const { password, ...userData } = seedUser;

    return this.userRepository.create({
      ...userData,
      password: this.hashUserPassword(password), // Hash the password
    });
  }

  async saveSeedUsers(users: User[]) {
    try {
      return await this.userRepository.save(users);
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  private hashUserPassword(
    password: string,
    saltOrRounds: number = 10,
  ): string {
    // Hash the password with a salt
    return hashSync(password, saltOrRounds);
  }

  private getJwtToken(payload: IJwtPayload): string {
    // Generate a JWT token with the payload
    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDatabaseExceptions(error: any): never {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error['code'] === '23505') {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error['detail'],
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.logger.error(error.toString());
    throw new InternalServerErrorException(
      `Could not perform database action. Please, review server logs.`,
    );
  }
}
