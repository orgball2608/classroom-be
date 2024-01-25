import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { StorageServiceAbstract } from './storage.abstract';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class StorageService implements StorageServiceAbstract {
  private _s3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this._s3Client = new S3Client({
      region: configService.getOrThrow<string>('aws.awsRegion'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('aws.awsAccessKeyID'),
        secretAccessKey: configService.getOrThrow<string>(
          'aws.awsSecretAccessKey',
        ),
      },
    });
  }

  async uploadFile(params: {
    key: string;
    file: Express.Multer.File;
  }): Promise<string | null> {
    const { key, file } = params;
    if (!file) {
      return null;
    }

    const bucketName = this.configService.getOrThrow<string>(
      'aws.awsPublicBucketsKey',
    );

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this._s3Client.send(new PutObjectCommand(uploadParams));

    const cloudfrontURL = this.configService.getOrThrow<string>(
      'aws.awsCloudfrontURL',
    );
    return `${cloudfrontURL}${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const bucketName = this.configService.getOrThrow<string>(
      'aws.awsPublicBucketsKey',
    );

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await this._s3Client.send(new DeleteObjectCommand(deleteParams));

      console.log('File deleted successfully');
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async multipartUploadFile(params: {
    key: string;
    file: Express.Multer.File;
  }): Promise<string | null> {
    const { key, file } = params;
    if (!file) {
      return null;
    }

    const bucketName = this.configService.getOrThrow<string>(
      'aws.awsPublicBucketsKey',
    );

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const parallelUpload = new Upload({
      client: this._s3Client,
      params: uploadParams,
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    parallelUpload.on('httpUploadProgress', (progress: any) => {
      console.log({ progress });
    });

    await parallelUpload.done();

    const cloudfrontURL = this.configService.getOrThrow<string>(
      'aws.awsCloudfrontURL',
    );

    return `${cloudfrontURL}${key}`;
  }
}
