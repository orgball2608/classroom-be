import * as AWS from 'aws-sdk';

import { ConfigService } from '@nestjs/config';
import { PROVIDERS } from '@src/constants';
import { Provider } from '@nestjs/common';

export const StorageServiceProvider: Provider<AWS.S3> = {
  useFactory: (configService: ConfigService) => {
    return new AWS.S3({
      accessKeyId: configService.get<string>('aws.awsAccessKeyID'),
      secretAccessKey: configService.get<string>('aws.awsSecretAccessKey'),
      region: configService.get<string>('aws.awsRegion'),
    });
  },
  provide: PROVIDERS.STORAGE,
  inject: [ConfigService],
};

export interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
