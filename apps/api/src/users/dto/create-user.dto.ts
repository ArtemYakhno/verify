import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from '../../common/constants/validation.constants';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.IS_NOT_EMPTY })
  @IsString({ message: VALIDATION_MESSAGES.IS_STRING })
  @MinLength(2, { message: VALIDATION_MESSAGES.MIN(2) })
  @MaxLength(50, { message: VALIDATION_MESSAGES.MAX(50) })
  @Matches(VALIDATION_RULES.LETTERS_ONLY_REGEX, {
    message: VALIDATION_MESSAGES.LETTERS_ONLY,
  })
  firstname!: string;

  @ApiProperty({ example: 'Snow' })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.IS_NOT_EMPTY })
  @IsString({ message: VALIDATION_MESSAGES.IS_STRING })
  @MinLength(2, { message: VALIDATION_MESSAGES.MIN(2) })
  @MaxLength(50, { message: VALIDATION_MESSAGES.MAX(50) })
  @Matches(VALIDATION_RULES.LETTERS_ONLY_REGEX, {
    message: VALIDATION_MESSAGES.LETTERS_ONLY,
  })
  lastname!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.IS_NOT_EMPTY })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email!: string;

  @ApiProperty({ example: 'Password1' })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.IS_NOT_EMPTY })
  @IsString({ message: VALIDATION_MESSAGES.IS_STRING })
  @MinLength(8, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(VALIDATION_RULES.PASSWORD_REGEX, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  password!: string;
}
