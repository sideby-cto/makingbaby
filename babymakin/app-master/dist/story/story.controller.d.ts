/// <reference types="multer" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryFilesService } from './story-files.service';
import { FileUploadService } from './file-upload-service';
import { Request } from 'express';
import { React2StoryDto } from './dto/react2Story.dto';
export declare class StoryController {
    private readonly storyService;
    private readonly storyFilesService;
    private readonly fileUploadService;
    constructor(storyService: StoryService, storyFilesService: StoryFilesService, fileUploadService: FileUploadService);
    react2Story(react2StoryDto: React2StoryDto): Promise<import("mongoose").Document<unknown, any, import("src/story/entities/story-reaction.entity").StoryDocument> & Omit<import("src/story/entities/story-reaction.entity").StoryReaction & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    create(createStoryDto: CreateStoryDto, files: Array<Express.Multer.File>): Promise<import("mongoose").Document<unknown, any, import("src/story/entities/story.entity").StoryDocument> & Omit<import("src/story/entities/story.entity").Story & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAll(request: Request): never[] | Promise<Omit<Omit<Omit<Omit<Omit<import("mongoose").Document<unknown, any, import("src/story/entities/story.entity").StoryDocument> & Omit<import("src/story/entities/story.entity").Story & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>, never>[]>;
    findOne(id: string): Promise<import("mongoose").LeanDocument<import("src/story/entities/story.entity").Story & Document & {
        _id: import("mongoose").Types.ObjectId;
    }> | null>;
    getUserStories(userId: string): Promise<import("mongoose").LeanDocument<import("src/story/entities/story.entity").Story & Document & {
        _id: import("mongoose").Types.ObjectId;
    }>[]>;
    update(id: string, updateStoryDto: UpdateStoryDto, files?: Array<Express.Multer.File>): Promise<import("mongoose").LeanDocument<import("src/story/entities/story.entity").Story & Document & {
        _id: import("mongoose").Types.ObjectId;
    }> | null>;
    remove(id: string): Promise<(import("mongoose").Document<unknown, any, import("src/story/entities/story.entity").StoryDocument> & Omit<import("src/story/entities/story.entity").Story & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null | undefined>;
    removeFiles(id: string): Promise<void>;
}
