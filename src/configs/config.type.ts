export type AppConfig = {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
  appURL: string;
  frontendURL: string;
  documentEnabled: boolean;
};

export type AuthConfig = {
  accessTokenSecret: string;
  accessTokenExpires: number;
  refreshTokenSecret: string;
  refreshTokenExpires: number;
  jwtForgotPasswordSecret: string;
  jwtForgotPasswordExpires: number;
  facebookClientID: string;
  facebookClientSecret: string;
  facebookCallbackURL: string;
  googleClientID: string;
  googleClientSecret: string;
  googleCallbackURL: string;
};

export type DatabaseConfig = {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
};

export type AwsConfig = {
  awsAccessKeyID: string;
  awsSecretAccessKey: string;
  awsPublicBucketsKey: string;
  awsCloudfrontURL: string;
  awsRegion: string;
  awsRateTTL: number;
  awsRateLimit: number;
};

export type MailConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  jwtMailSecret: string;
  jwtMailExpires: number;
};
