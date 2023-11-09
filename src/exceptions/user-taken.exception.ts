import { NotFoundException } from '@nestjs/common';

export class UserTakenException extends NotFoundException {
  constructor(error?: string) {
    super('error.userTaken', error);
  }
}
