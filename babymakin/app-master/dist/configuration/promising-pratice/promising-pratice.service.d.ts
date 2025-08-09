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
import { CreatePromisingPraticeDto } from './dto/create-promising-pratice.dto';
import { UpdatePromisingPraticeDto } from './dto/update-promising-pratice.dto';
import { PromisingPractise, PromisingPractiseDocument } from './entities/promising-pratice.entity';
export declare class PromisingPraticeService {
    private promisingModel;
    constructor(promisingModel: Model<PromisingPractiseDocument>);
    create(createPromisingPraticeDto: CreatePromisingPraticeDto): Promise<import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>)[], import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, PromisingPractiseDocument>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, PromisingPractiseDocument>;
    update(id: string, updatePromisingPraticeDto: UpdatePromisingPraticeDto): import("mongoose").Query<(import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, PromisingPractiseDocument>;
    remove(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, PromisingPractiseDocument> & Omit<PromisingPractise & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, PromisingPractiseDocument>;
}
