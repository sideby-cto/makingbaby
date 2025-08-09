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
import { Model } from 'mongoose';
import { CreateSchoolClassificationDto } from './dto/create-school-classification.dto';
import { UpdateSchoolClassificationDto } from './dto/update-school-classification.dto';
import { SchoolClassification, SchoolClassificationDocument } from './entities/school-classification.entity';
export declare class SchoolClassificationService {
    private schoolClassificationModel;
    constructor(schoolClassificationModel: Model<SchoolClassificationDocument>);
    create(createSchoolClassificationDto: CreateSchoolClassificationDto): Promise<import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[], import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolClassificationDocument>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolClassificationDocument>;
    update(id: string, updateSchoolClassificationDto: UpdateSchoolClassificationDto): import("mongoose").Query<(import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolClassificationDocument>;
    remove(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, SchoolClassificationDocument> & Omit<SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolClassificationDocument>;
}
