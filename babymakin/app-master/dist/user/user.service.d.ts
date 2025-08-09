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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { PaginationInput } from 'src/share/types/pagination-input';
import { DistrictService } from '../configuration/district/district.service';
import { SchoolService } from '../configuration/school/school.service';
export type UserOutput = {
    name: string;
    email: string;
    schools: string;
    permissionLevel: string;
    teams: string;
    id: string;
    district: string;
    organization: string;
    inactive?: boolean;
};
export declare class UserService {
    private userModel;
    private districtService;
    private schoolService;
    constructor(userModel: Model<UserDocument>, districtService: DistrictService, schoolService: SchoolService);
    create(createUserDto: CreateUserDto): Promise<UserOutput>;
    findAll(input: PaginationInput): Promise<UserOutput[]>;
    findOne(id: string): Promise<UserOutput | null>;
    update(id: string, updateUserDto: UpdateUserDto): import("mongoose").Query<(User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }) | null, User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, UserDocument>;
    remove(id: string): import("mongoose").Query<(User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }) | null, User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, UserDocument>;
    findUserByEmail(email: string): Promise<User | undefined | null>;
}
