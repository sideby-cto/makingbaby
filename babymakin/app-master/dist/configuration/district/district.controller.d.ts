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
import { DistrictService } from './district.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
export declare class DistrictController {
    private readonly districtService;
    constructor(districtService: DistrictService);
    create(createDistrictDto: CreateDistrictDto): Promise<import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getSchoolsForDistrict(districtId: string): Promise<Omit<Omit<Omit<Omit<Omit<Omit<import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>, never>, never>[]>;
    findAll(): import("mongoose").Query<Omit<Omit<Omit<Omit<Omit<import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>[], import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("src/configuration/district/entities/district.entity").DistrictDocument>;
    findOne(id: string): import("mongoose").Query<(import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }) | null, import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("src/configuration/district/entities/district.entity").DistrictDocument>;
    getStudentCharatertices(id: string): Promise<(import("mongoose").Document<unknown, any, import("src/configuration/student-charactice/entities/student-charactice.entity").StudentCharacticeDocument> & Omit<import("src/configuration/student-charactice/entities/student-charactice.entity").StudentCharactice & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    getPromisingPractise(id: string): Promise<(import("mongoose").Document<unknown, any, import("src/configuration/promising-pratice/entities/promising-pratice.entity").PromisingPractiseDocument> & Omit<import("src/configuration/promising-pratice/entities/promising-pratice.entity").PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    getSuccessSigns(id: string): Promise<(import("mongoose").Document<unknown, any, import("src/configuration/student-success-sign/entities/student-success-sign.entity").StudentSuccessSignDocument> & Omit<import("src/configuration/student-success-sign/entities/student-success-sign.entity").StudentSuccessSign & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    update(id: string, updateDistrictDto: UpdateDistrictDto): import("mongoose").Query<(import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }) | null, import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("src/configuration/district/entities/district.entity").DistrictDocument>;
    remove(id: string): import("mongoose").Query<(import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }) | null, import("src/configuration/district/entities/district.entity").District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("src/configuration/district/entities/district.entity").DistrictDocument>;
}
