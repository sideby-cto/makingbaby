import { S3Client } from '@aws-sdk/client-s3';
import { DeleteObjectCommandOutput, PutObjectCommandOutput } from '@aws-sdk/client-s3/dist-types/commands';
export declare class FileUploadService {
    client: S3Client;
    constructor();
    uploadFile(file: any, s3Key: string): Promise<PutObjectCommandOutput>;
    deleteFile(s3Key: string): Promise<DeleteObjectCommandOutput>;
}
