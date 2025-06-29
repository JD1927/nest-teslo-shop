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

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

      // TODO: Return JWT or session token if needed
      return { ...user, password: undefined }; // Exclude password from the response
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;

      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true },
      });

      if (!user) throw new UnauthorizedException('Invalid credentials.');

      if (!compareSync(password, user.password))
        throw new UnauthorizedException('Invalid credentials.');

      this.logger.log(`User ${email} logged in successfully.`);
      // TODO: Return JWT or session token if needed
      return { email };
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  private handleDatabaseExceptions(error: any) {
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
