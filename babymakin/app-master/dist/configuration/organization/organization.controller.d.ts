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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    create(createOrganizationDto: CreateOrganizationDto): Promise<import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/organization/entities/organization.entity").OrganizationDocument>;
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[], import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/organization/entities/organization.entity").OrganizationDocument>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/organization/entities/organization.entity").OrganizationDocument>;
    remove(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, import("src/configuration/organization/entities/organization.entity").OrganizationDocument> & Omit<import("src/configuration/organization/entities/organization.entity").Organization & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, import("src/configuration/organization/entities/organization.entity").OrganizationDocument>;
}
