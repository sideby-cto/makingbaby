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
import mongoose from 'mongoose';
import { District } from '../../configuration/district/entities/district.entity';
import { School } from '../../configuration/school/entities/school.entity';
export type StoryDocument = Story & Document;
export type StoryType = 'SW' | 'LL';
export declare class Story {
    type: StoryType;
    author: string;
    userId: string;
    storyAction: string;
    likes: number;
    high5s: number;
    Insighfuls: number;
    storyExperience: string;
    storyObservation: string;
    successSigns: string[];
    studentCharacteristics: string[];
    promisingPractices: string[];
    files: string[];
    district: District;
    school: School;
    taggedUsersId: string[];
}
export declare const StorySchema: mongoose.Schema<Story, mongoose.Model<Story, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Story>;
