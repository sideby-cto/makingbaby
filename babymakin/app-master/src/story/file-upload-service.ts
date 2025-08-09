import { Injectable } from '@nestjs/common';
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import {
  DeleteObjectCommandInput,
  DeleteObjectCommandOutput,
  PutObjectCommandInput,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3/dist-types/commands';

@Injectable()
export class FileUploadService {
  client: S3Client;
  constructor() {
    this.client = new S3Client({ region: 'us-east-1' });
  }

  async uploadFile(file: any, s3Key: string): Promise<PutObjectCommandOutput> {
    const params: PutObjectCommandInput = {
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    
    const command = new PutObjectCommand(params);
    return this.client.send(command);
  }

  async deleteFile(s3Key: string): Promise<DeleteObjectCommandOutput> {
    const params: DeleteObjectCommandInput = {
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
    };

    const command = new DeleteObjectCommand(params);
    return this.client.send(command);
  }
}
