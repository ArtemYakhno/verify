import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from '../../common/constants/validation.constants';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2, { message: VALIDATION_MESSAGES.MIN_2 })
  @MaxLength(50, { message: VALIDATION_MESSAGES.MAX_50 })
  @Matches(VALIDATION_RULES.LETTERS_ONLY_REGEX, {
    message: VALIDATION_MESSAGES.LETTERS_ONLY,
  })
  firstname!: string;

  @ApiProperty({ example: 'Snow' })
  @IsString()
  @MinLength(2, { message: VALIDATION_MESSAGES.MIN_2 })
  @MaxLength(50, { message: VALIDATION_MESSAGES.MAX_50 })
  @Matches(VALIDATION_RULES.LETTERS_ONLY_REGEX, {
    message: VALIDATION_MESSAGES.LETTERS_ONLY,
  })
  lastname!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email!: string;

  @ApiProperty({ example: 'Password1' })
  @IsString()
  @MinLength(8, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(VALIDATION_RULES.PASSWORD_REGEX, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  password!: string;
}
