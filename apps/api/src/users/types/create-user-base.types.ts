import { CreateUserDto } from '../dto/create-user.dto';

export type CreateUserBase = Omit<CreateUserDto, 'password'>;
