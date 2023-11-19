import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SERVICES } from '@src/constants/service';
import { S3 } from 'aws-sdk';

@Injectable()
export class StorageService {
  constructor(
    @Inject(SERVICES.STORAGE)
    private readonly storageClient: S3,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(params: { key: string; file: Express.Multer.File }) {
    const { key, file } = params;
    const bucketName = this.configService.getOrThrow<string>(
      'aws.awsPublicBucketsKey',
    );

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await this.storageClient.putObject(uploadParams).promise();
    const cloudfrontURL = this.configService.getOrThrow<string>(
      'aws.awsCloudfrontURL',
    );
    return `${cloudfrontURL}${key}`;
  }

  deleteFile(key: string) {
    const bucketName = this.configService.getOrThrow<string>(
      'aws.awsPublicBucketsKey',
    );
    return this.storageClient
      .deleteObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();
  }
}
