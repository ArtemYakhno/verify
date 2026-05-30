import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { VALIDATION_RULES } from '../constants/validation.constants';

@Injectable()
export class PasswordGeneratorService {
  private readonly upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly lower = 'abcdefghijklmnopqrstuvwxyz';
  private readonly digits = '0123456789';
  private readonly all = this.upper + this.lower + this.digits;

  generate(length = 12): string {
    if (length < 8) {
      throw new Error('Password length must be at least 8');
    }

    const required = [
      this.randomChar(this.upper),
      this.randomChar(this.lower),
      this.randomChar(this.digits),
    ];

    const rest = Array.from({ length: length - required.length }, () =>
      this.randomChar(this.all),
    );

    const password = this.shuffle([...required, ...rest]).join('');

    if (!VALIDATION_RULES.PASSWORD_REGEX.test(password)) {
      return this.generate(length);
    }

    return password;
  }

  private randomChar(source: string): string {
    return source[randomInt(0, source.length)];
  }

  private shuffle(chars: string[]): string[] {
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars;
  }
}
