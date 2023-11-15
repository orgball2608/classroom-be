export type AppConfig = {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
  appUrl: string;
};

export type AuthConfig = {
  accessTokenSecret: string;
  accessTokenExpires: number;
  refreshTokenSecret: string;
  refreshTokenExpires: number;
  jwtMailSecret: string;
  jwtMailExpires: number;
  jwtForgotPasswordSecret: string;
  jwtForgotPasswordExpires: number;
};

export type DatabaseConfig = {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
};
