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
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
export declare class SchoolController {
    private readonly schoolService;
    constructor(schoolService: SchoolService);
    create(createSchoolDto: CreateSchoolDto): Promise<import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAll(): import("mongoose").Query<Omit<Omit<Omit<Omit<Omit<Omit<import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>, never>, never>[], import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school/entities/school.entity").SchoolDocument>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school/entities/school.entity").SchoolDocument>;
    getStudentCharatertices(id: string): Promise<(import("mongoose").Document<unknown, any, import("src/configuration/student-charactice/entities/student-charactice.entity").StudentCharacticeDocument> & Omit<import("src/configuration/student-charactice/entities/student-charactice.entity").StudentCharactice & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    getPromisingPractise(id: string): Promise<(import("mongoose").Document<unknown, any, import("src/configuration/promising-pratice/entities/promising-pratice.entity").PromisingPractiseDocument> & Omit<import("src/configuration/promising-pratice/entities/promising-pratice.entity").PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    getSuccessSigns(id: string): Promise<(import("mongoose").Document<unknown, any, import("src/configuration/student-success-sign/entities/student-success-sign.entity").StudentSuccessSignDocument> & Omit<import("src/configuration/student-success-sign/entities/student-success-sign.entity").StudentSuccessSign & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    update(id: string, updateSchoolDto: UpdateSchoolDto): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school/entities/school.entity").SchoolDocument>;
    remove(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school/entities/school.entity").SchoolDocument>;
}
