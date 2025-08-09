import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { basename, join } from 'path';
import { CreateStoryFileDto } from './dto/create-story-file.dto';
import { StoryFile, StoryFileDocument } from './entities/story-file.entity';
import { FileUploadService } from './file-upload-service';

@Injectable()
export class StoryFilesService {
  constructor(
    @InjectModel(StoryFile.name) private model: Model<StoryFileDocument>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  uploadFilesAndGetUrls(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map(async (file) => {
      const s3Key = `${Date.now()}_${file.originalname}`;
      await this.fileUploadService.uploadFile(file, s3Key);
      return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
    }));
  }

  create(createStoryFileDto: CreateStoryFileDto) {
    const entity = new this.model(createStoryFileDto);
    return entity.save();
  }

  saveFileUrlsToDatabase(fileUrls: string[]): Promise<any[]> {
    return Promise.all(
      fileUrls.map(async (url) => {
        const file: CreateStoryFileDto = { url };
        const createdFile = await this.create(file);
        return createdFile;
      }),
    )
  }

  findAll() {
    return `This action returns all storyFiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storyFile`;
  }

  async remove(id: string) {
    await this.deleteFilesForStory([id]);
  }

  async deleteFilesForStory(fileIds: string[]) {
    const files = await this.model.where('_id').in(fileIds).lean().exec();
    files
      .map((file) => join(process.cwd(), 'uploads', basename(file.url)))
      .forEach((url) => {
        const s3Key = url.split('/').pop();
        if (s3Key) this.fileUploadService.deleteFile(s3Key);
      });
    fileIds.forEach(async (id) => await this.model.findByIdAndDelete(id));
  }
}
