import { Injectable, PipeTransform } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class UserExistsPipe implements PipeTransform<number, Promise<number>> {
  constructor(private readonly userService: UsersService) {}

  async transform(userId: number): Promise<number> {
    const user = await this.userService.findById(userId);
    return user.id;
  }
}
