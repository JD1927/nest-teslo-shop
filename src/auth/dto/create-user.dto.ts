import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter and one number.',
  })
  password: string;

  @IsString()
  @MinLength(3)
  fullName: string;
}
