import type { Request as ExpressRequest } from 'express';
import { Profile as FaceBookProfile } from 'passport-facebook';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import type { Request as NestRequest } from '@nestjs/common';
import { User } from '@prisma/client';

//TODO: refactor
export interface OAuthRequestUser {
  profile: GoogleProfile | FaceBookProfile;
}

type CombinedRequest = ExpressRequest & typeof NestRequest;
export interface UserRequest extends CombinedRequest {
  user: User;
}

export interface OAuthRequest extends CombinedRequest {
  user: OAuthRequestUser;
}
