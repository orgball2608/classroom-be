export class SimpleUserEntity {
  id: string;
  email: string;
  avatar: string;
  firstName: string;
  lastName: string;

  constructor(partial: Partial<SimpleUserEntity>) {
    Object.assign(this, partial);
  }
}
