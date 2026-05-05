import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from '../../../common/constants/validation.constants';

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword1' })
  @IsString()
  @MinLength(8, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(VALIDATION_RULES.PASSWORD_REGEX, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  currentPassword!: string;

  @ApiProperty({ example: 'NewPassword2' })
  @IsString()
  @MinLength(8, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  @Matches(VALIDATION_RULES.PASSWORD_REGEX, {
    message: VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
  })
  newPassword!: string;
}
