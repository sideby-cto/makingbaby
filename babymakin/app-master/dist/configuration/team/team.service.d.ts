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
import { UserDocument } from 'src/user/entities/user.entity';
import { DistrictDocument, DistrictGoal } from '../district/entities/district.entity';
import { School, SchoolDocument } from '../school/entities/school.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team, TeamDocument } from './entities/team.entity';
export declare class TeamService {
    private teamModel;
    private userModel;
    private districtModel;
    private schoolModel;
    constructor(teamModel: Model<TeamDocument>, userModel: Model<UserDocument>, districtModel: Model<DistrictDocument>, schoolModel: Model<SchoolDocument>);
    create(createTeamDto: CreateTeamDto): Promise<import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    findAll(): import("mongoose").Query<Omit<Omit<Omit<Omit<Omit<import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, never>, never>, never>, never>, never>[], import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, TeamDocument>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, TeamDocument>;
    update(id: string, updateTeamDto: UpdateTeamDto): import("mongoose").Query<(import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, TeamDocument>;
    remove(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>) | null, import("mongoose").Document<unknown, any, TeamDocument> & Omit<Team & Document & {
        _id: import("mongoose").Types.ObjectId;
    }, never>, {}, TeamDocument>;
    getGoalDataForTeam(goal: any, teamId: any): Promise<{
        teamGoal: import("mongoose").LeanDocument<DistrictGoal> | undefined;
        schoolId: School | undefined;
    }>;
    findUsersForTeam(teamId: string): Promise<any[]>;
}
