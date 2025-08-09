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
import { SchoolClassificationService } from './school-classification.service';
import { CreateSchoolClassificationDto } from './dto/create-school-classification.dto';
import { UpdateSchoolClassificationDto } from './dto/update-school-classification.dto';
export declare class SchoolClassificationController {
    private readonly schoolClassificationService;
    constructor(schoolClassificationService: SchoolClassificationService);
    create(createSchoolClassificationDto: CreateSchoolClassificationDto): Promise<import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[], import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument>;
    update(id: string, updateSchoolClassificationDto: UpdateSchoolClassificationDto): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument>;
    remove(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument> & Omit<import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassification & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school-classification/entities/school-classification.entity").SchoolClassificationDocument>;
}
