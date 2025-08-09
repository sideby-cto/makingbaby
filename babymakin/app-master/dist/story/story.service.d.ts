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
/// <reference types="mongoose/types/inferschematype" />
import { Model, Types } from 'mongoose';
import { SchoolService } from '../configuration/school/school.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { React2StoryDto } from './dto/react2Story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryReaction, StoryDocument as StoryReactionDoc } from './entities/story-reaction.entity';
import { Story, StoryDocument as StoryDoc } from './entities/story.entity';
import { StoryFilesService } from './story-files.service';
export declare class StoryService {
    private model;
    private storyReactionModel;
    private readonly schoolService;
    private readonly storyFileService;
    constructor(model: Model<StoryDoc>, storyReactionModel: Model<StoryReactionDoc>, schoolService: SchoolService, storyFileService: StoryFilesService);
    react2Story(react2StoryDto: React2StoryDto): Promise<import("mongoose").Document<unknown, any, StoryReactionDoc> & Omit<StoryReaction & Document & {
        _id: Types.ObjectId;
    }, never>>;
    private getReactionsType;
    create(createStoryDto: CreateStoryDto): Promise<import("mongoose").Document<unknown, any, StoryDoc> & Omit<Story & Document & {
        _id: Types.ObjectId;
    }, never>>;
    findAll(school: any, district: any): Promise<Omit<Omit<Omit<Omit<Omit<import("mongoose").Document<unknown, any, StoryDoc> & Omit<Story & Document & {
        _id: Types.ObjectId;
    }, never>, never>, never>, never>, never>, never>[]>;
    findOne(id: string): Promise<import("mongoose").LeanDocument<Story & Document & {
        _id: Types.ObjectId;
    }> | null>;
    update(id: string, updateStoryDto: UpdateStoryDto): import("mongoose").Query<import("mongoose").LeanDocument<Story & Document & {
        _id: Types.ObjectId;
    }> | null, import("mongoose").Document<unknown, any, StoryDoc> & Omit<Story & Document & {
        _id: Types.ObjectId;
    }, never>, {}, StoryDoc>;
    addFilesToStory(storyId: string, files: string[]): Promise<void>;
    remove(id: string): Promise<(import("mongoose").Document<unknown, any, StoryDoc> & Omit<Story & Document & {
        _id: Types.ObjectId;
    }, never>) | null | undefined>;
    getUserStories(userId: string): Promise<import("mongoose").LeanDocument<Story & Document & {
        _id: Types.ObjectId;
    }>[]>;
}
