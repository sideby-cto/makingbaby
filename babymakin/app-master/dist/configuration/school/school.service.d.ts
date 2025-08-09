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
import { PromisingPractise, PromisingPractiseDocument } from '../promising-pratice/entities/promising-pratice.entity';
import { StudentCharactice, StudentCharacticeDocument } from '../student-charactice/entities/student-charactice.entity';
import { StudentSuccessSign, StudentSuccessSignDocument } from '../student-success-sign/entities/student-success-sign.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School, SchoolDocument } from './entities/school.entity';
export declare class SchoolService {
    private schoolModel;
    private studentCharacticeModel;
    private promisingPracticeModel;
    private successSigneModel;
    constructor(schoolModel: Model<SchoolDocument>, studentCharacticeModel: Model<StudentCharacticeDocument>, promisingPracticeModel: Model<PromisingPractiseDocument>, successSigneModel: Model<StudentSuccessSignDocument>);
    create(createSchoolDto: CreateSchoolDto): Promise<import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAll(): import("mongoose").Query<Omit<Omit<Omit<Omit<Omit<Omit<import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>, never>, never>[], import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolDocument>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolDocument>;
    update(id: string, updateSchoolDto: UpdateSchoolDto): import("mongoose").Query<(import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolDocument>;
    remove(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolDocument>;
    getSchoolsForDistrict(districtId: string): import("mongoose").Query<Omit<Omit<Omit<Omit<Omit<Omit<import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>, never>, never>[], import("mongoose").Document<unknown, any, SchoolDocument> & Omit<School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, SchoolDocument>;
    getStudentCharateriticsForSchool(schoolId: string): Promise<(import("mongoose").Document<unknown, any, StudentCharacticeDocument> & Omit<StudentCharactice & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    getPromisingPractiseForSchool(schoolId: string): Promise<(import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    getSuccessSignForSchool(schoolId: string): Promise<(import("mongoose").Document<unknown, any, StudentSuccessSignDocument> & Omit<StudentSuccessSign & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
}
