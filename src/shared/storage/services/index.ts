import { ConfigService } from '@nestjs/config';
import { PROVIDERS } from '@src/constants';
import { Provider } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

export const StorageServiceProvider: Provider<S3Client> = {
  useFactory: (configService: ConfigService) => {
    return new S3Client({
      region: configService.getOrThrow<string>('aws.awsRegion'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('aws.awsAccessKeyID'),
        secretAccessKey: configService.getOrThrow<string>(
          'aws.awsSecretAccessKey',
        ),
      },
    });
  },
  provide: PROVIDERS.STORAGE,
  inject: [ConfigService],
};
