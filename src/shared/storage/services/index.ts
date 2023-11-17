// index.ts

import * as AWS from 'aws-sdk';

import { Provider } from '@nestjs/common';
import { SERVICES } from '@src/constants/service';

const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const StorageServiceProvider: Provider<AWS.S3> = {
  provide: SERVICES.STORAGE,
  useValue: S3,
};

export interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
