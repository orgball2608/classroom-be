import { NotFoundException } from '@nestjs/common';
import { USERS_MESSAGES } from '@src/constants';

export class UserNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super(USERS_MESSAGES.USER_NOT_FOUND, error);
  }
}
