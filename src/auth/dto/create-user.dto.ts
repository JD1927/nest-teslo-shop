import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter and one number.',
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  fullName: string;
}
