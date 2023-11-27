import type { Request as ExpressRequest } from 'express';
import type { Request as NestRequest } from '@nestjs/common';

export interface AccessTokenParsed {
  id: number;
}

type CombinedRequest = ExpressRequest & typeof NestRequest;
export interface UserRequest extends CombinedRequest {
  user: AccessTokenParsed;
}
