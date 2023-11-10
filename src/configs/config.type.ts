export type AppConfig = {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
};

export type AuthConfig = {
  accessTokenSecret?: string;
  accessTokenExpires?: number;
  refreshTokenSecret?: string;
  refreshTokenExpires?: number;
};

export type DatabaseConfig = {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
};
