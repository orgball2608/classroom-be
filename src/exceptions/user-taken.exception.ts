import { NotFoundException } from '@nestjs/common';
import { USERS_MESSAGES } from '@src/constants/message';

export class UserTakenException extends NotFoundException {
  constructor(error?: string) {
    super(USERS_MESSAGES.USER_IS_TAKEN, error);
  }
}
