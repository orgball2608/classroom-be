import { Inject, Injectable } from '@nestjs/common';
import { SERVICES } from '@src/constants/service';
import { S3 } from 'aws-sdk';
import * as process from 'process';

@Injectable()
export class StorageService {
  constructor(
    @Inject(SERVICES.STORAGE)
    private readonly storageClient: S3,
  ) {}

  async uploadFile(params: { key: string; file: Express.Multer.File }) {
    const { key } = params;
    const uploadParams = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
      Key: key,
      Body: params.file.buffer,
      ContentType: 'image/jpeg',
    };
    await this.storageClient.putObject(uploadParams).promise();
    return key;
  }
  deleteFile(key: string) {
    return this.storageClient
      .deleteObject({
        Bucket: process.env.AWS_PUBLIC_BUCKET_KEY,
        Key: String(key),
      })
      .promise();
  }
}
