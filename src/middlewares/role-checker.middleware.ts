import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import { PROVIDERS } from '@src/constants';
import { UserRequest } from '@src/interfaces';
import { UserRole } from '@prisma/client';

@Injectable()
export class RoleCheckerMiddleware implements NestMiddleware {
  constructor(private readonly allowedRoles: string[]) {}

  use(req: UserRequest, res: any, next: () => void) {
    const userRole = req.user.role;

    const hasRole = () => this.allowedRoles.includes(userRole);

    if (hasRole()) {
      next();
    } else {
      throw new UnauthorizedException();
    }
  }
}

export function RoleChecker(allowedRoles: UserRole[]) {
  return {
    provide: PROVIDERS.ROLE_CHECKER,
    useClass: RoleCheckerMiddleware,
    inject: [allowedRoles],
  };
}
