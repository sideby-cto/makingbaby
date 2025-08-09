import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryFilesService } from './story-files.service';
import { FileUploadService } from './file-upload-service';
import { CreateStoryFileDto } from './dto/create-story-file.dto';
import { Request } from 'express';
import { memoryStorage } from 'multer';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { React2StoryDto } from './dto/react2Story.dto';

@Controller('story')
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly storyFilesService: StoryFilesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('react')
  async react2Story(@Body() react2StoryDto: React2StoryDto) {
    const reaction = await this.storyService.react2Story(react2StoryDto);
    return reaction;
  }

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() createStoryDto: CreateStoryDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // Upload files and generate S3 access urls
    const urls = await this.storyFilesService.uploadFilesAndGetUrls(files);
    
    // Save file urls to `storyfile` table
    const savedFiles = await this.storyFilesService.saveFileUrlsToDatabase(urls);

    // Get file IDs and group components in the payload
    const fileIds = savedFiles.map((file) => file._id);
    const storyInput = { ...createStoryDto, files: fileIds };

    // Create and save the new story in `story` table
    const story = await this.storyService.create(storyInput);
    return story;
  }

  @Get()
  findAll(@Req() request: Request) {
    const { district, school } = request.query;
    if (!district && !school) return [];
    return this.storyService.findAll(school, district);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storyService.findOne(id);
  }

  @Get('userStories/:userId')
  getUserStories(@Param('userId') userId: string) {
    return this.storyService.getUserStories(userId);
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({
    storage: memoryStorage(),
  }))
  async update(
    @Param('id') id: string, 
    @Body() updateStoryDto: UpdateStoryDto,
    @UploadedFiles() files: Array<Express.Multer.File> = [],
  ) {
    // Initialize an empty array for file IDs
    let fileIds: any[] = [];

    if (files && files.length > 0) {
      // Replace and Delete the save of previous files
      const existingStory = await this.storyService.findOne(id);
      if (existingStory?.files && existingStory?.files.length > 0) {
        const prevFileIds = existingStory.files;
        await this.storyFilesService.deleteFilesForStory(prevFileIds);
      }

      // Upload files and generate S3 access urls
      const urls = await this.storyFilesService.uploadFilesAndGetUrls(files);
      
      // Save file urls to `storyfile` table
      const savedFiles = await this.storyFilesService.saveFileUrlsToDatabase(urls);

      // Extract file IDs from the saved files
      fileIds = savedFiles.map((file) => file._id);
    }

    // If there are file IDs, include them in the payload
    const updatePayload = fileIds.length > 0 
      ? { ...updateStoryDto, files: fileIds } 
      : updateStoryDto;

    // Proceed to update the story with the new data
    const updatedStory = await this.storyService.update(id, updatePayload);
    return updatedStory;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storyService.remove(id);
  }

  @Delete('files/:id')
  removeFiles(@Param('id') id: string) {
    return this.storyFilesService.remove(id);
  }

}
