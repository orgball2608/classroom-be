import { Course, GradeComposition, User } from '@prisma/client';

import type { Request as ExpressRequest } from 'express';
import { Profile as FaceBookProfile } from 'passport-facebook';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import type { Request as NestRequest } from '@nestjs/common';

export interface IOAuthRequestUser {
  profile: GoogleProfile | FaceBookProfile;
}

type CombinedRequest = ExpressRequest & typeof NestRequest;
export interface IUserRequest extends CombinedRequest {
  user: User;
  isEnrolled?: boolean;
}

export interface ICourseRequest extends IUserRequest {
  course: Course;
}

export interface IGradeCompositionRequest extends ICourseRequest {
  gradeComposition: GradeComposition;
}

export interface IOAuthRequest extends CombinedRequest {
  user: IOAuthRequestUser;
}
