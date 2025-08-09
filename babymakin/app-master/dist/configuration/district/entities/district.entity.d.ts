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
import { Document, Types } from 'mongoose';
import { Organization } from '../../organization/entities/organization.entity';
export declare class DistrictGoal extends Document {
    goal: Types.ObjectId;
    promisingPractices: string[];
    successSigns: string[];
    studentCharacteristics: string[];
}
export declare const DistrictGoalSchema: import("mongoose").Schema<DistrictGoal, import("mongoose").Model<DistrictGoal, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DistrictGoal>;
export type DistrictDocument = District & Document;
export declare class District {
    name: string;
    organization: Organization;
    districtGoals: DistrictGoal[];
}
export declare const DistrictSchema: import("mongoose").Schema<District, import("mongoose").Model<District, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, District>;
