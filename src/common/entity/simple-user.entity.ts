import { User } from '@prisma/client';

export class SimpleUserEntity {
  id: number;
  email: string;
  avatar: string;
  firstName: string;
  lastName: string;

  constructor(partial: Partial<User>) {
    this.id = partial.id;
    this.email = partial.email;
    this.avatar = partial.avatar;
    this.firstName = partial.firstName;
    this.lastName = partial.lastName;
  }
}
