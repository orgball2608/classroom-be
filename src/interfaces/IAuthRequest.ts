import type { Request as ExpressRequest } from 'express';
import { Profile as FaceBookProfile } from 'passport-facebook';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import type { Request as NestRequest } from '@nestjs/common';

export interface AccessTokenParsed {
  id: number;
}

export interface OAuthRequestUser {
  profile: GoogleProfile | FaceBookProfile;
}

type CombinedRequest = ExpressRequest & typeof NestRequest;
export interface UserRequest extends CombinedRequest {
  user: AccessTokenParsed;
}

export interface OAuthRequest extends CombinedRequest {
  user: OAuthRequestUser;
}
