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
import { SchoolService } from '../school/school.service';
import { StudentCharactice, StudentCharacticeDocument } from '../student-charactice/entities/student-charactice.entity';
import { StudentSuccessSign, StudentSuccessSignDocument } from '../student-success-sign/entities/student-success-sign.entity';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { District, DistrictDocument } from './entities/district.entity';
export declare class DistrictService {
    private districtModel;
    private schoolService;
    private studentCharacticeModel;
    private promisingPracticeModel;
    private successSigneModel;
    constructor(districtModel: Model<DistrictDocument>, schoolService: SchoolService, studentCharacticeModel: Model<StudentCharacticeDocument>, promisingPracticeModel: Model<PromisingPractiseDocument>, successSigneModel: Model<StudentSuccessSignDocument>);
    create(createDistrictDto: CreateDistrictDto): Promise<District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAll(): import("mongoose").Query<Omit<Omit<Omit<Omit<Omit<District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>[], District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, DistrictDocument>;
    findOne(id: string): import("mongoose").Query<(District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }) | null, District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, DistrictDocument>;
    update(id: string, updateDistrictDto: UpdateDistrictDto): import("mongoose").Query<(District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }) | null, District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, DistrictDocument>;
    remove(id: string): import("mongoose").Query<(District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }) | null, District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, DistrictDocument>;
    getSchoolsForDistrict(districtId: string): import("mongoose").Query<Omit<Omit<Omit<Omit<Omit<Omit<import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>, never>, never>[], import("mongoose").Document<unknown, any, import("src/configuration/school/entities/school.entity").SchoolDocument> & Omit<import("src/configuration/school/entities/school.entity").School & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/school/entities/school.entity").SchoolDocument>;
    getDistrictsForOrganization(organizationId: string): import("mongoose").Query<(District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[], District & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, DistrictDocument>;
    getStudentCharateriticsForDistrict(districtId: string): Promise<(import("mongoose").Document<unknown, any, StudentCharacticeDocument> & Omit<StudentCharactice & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    getPromisingPractiseForDistrict(districtId: string): Promise<(import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
    getSuccessSignForDistrict(districtId: string): Promise<(import("mongoose").Document<unknown, any, StudentSuccessSignDocument> & Omit<StudentSuccessSign & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[]>;
}
