import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, hashSync } from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { IJwtPayload } from './models/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

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
        password: hashSync(password, 10), // Hash the password
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
      select: { email: true, password: true, id: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials.');

    if (!compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials.');

    this.logger.log(`User ${email} logged in successfully.`);

    return { email, token: this.getJwtToken({ email, uid: user.id }) };
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
