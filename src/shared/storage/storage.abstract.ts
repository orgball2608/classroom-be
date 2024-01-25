export abstract class StorageServiceAbstract {
  abstract uploadFile(params: {
    key: string;
    file: Express.Multer.File;
  }): Promise<string | null>;

  abstract deleteFile(key: string): Promise<void>;

  abstract multipartUploadFile(params: {
    key: string;
    file: Express.Multer.File;
  }): Promise<string | null>;
}
