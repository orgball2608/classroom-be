import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import { AUTHORIZATION_MESSAGES } from '@src/constants';
import { IUserRequest } from '@src/interfaces';
import { UserRole } from '@prisma/client';

@Injectable()
export class RoleCheckerMiddleware implements NestMiddleware {
  constructor(private readonly allowedRoles: UserRole[]) {}

  use(req: IUserRequest, res: any, next: () => void) {
    const userRole = req.user.role;

    const hasRole = () => this.allowedRoles.includes(userRole);

    if (hasRole()) {
      next();
    } else {
      throw new UnauthorizedException(
        AUTHORIZATION_MESSAGES.DO_NOT_HAVE_PERMISSION_TO_ACCESS_THIS_RESOURCE,
      );
    }
  }
}

export function RoleChecker(allowedRoles: UserRole[]) {
  const middleware = new RoleCheckerMiddleware(allowedRoles);

  return (req: IUserRequest, res: any, next: any) =>
    middleware.use(req, res, next);
}
