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
import mongoose, { Model } from 'mongoose';
import { SchoolDocument } from 'src/configuration/school/entities/school.entity';
import { SchoolService } from 'src/configuration/school/school.service';
import { TeamService } from 'src/configuration/team/team.service';
import { UserService } from 'src/user/user.service';
import { Story, StoryDocument } from 'src/story/entities/story.entity';
export interface DashboardFilter {
    district: any;
    school: any;
    team?: any;
    goal: any;
    successSign?: any;
    from?: any;
    to?: any;
    all?: any;
    userId?: any;
    storyType?: any;
    studentCharacteristics?: any;
    promisingPractices?: any;
    userToken?: any;
}
export type DecodedUserToken = {
    sub?: string;
    version?: string;
    iat?: number;
    exp?: number;
};
export declare class DashboardService {
    private model;
    private schoolModel;
    private schoolService;
    private teamService;
    private userService;
    private COLORS;
    constructor(model: Model<StoryDocument>, schoolModel: Model<SchoolDocument>, schoolService: SchoolService, teamService: TeamService, userService: UserService);
    getDashboardData(filter: DashboardFilter): Promise<{
        stories: mongoose.LeanDocument<Story & Document & {
            _id: mongoose.Types.ObjectId;
        }>[];
        successSigns: any[];
        promisingPractices: any[];
        studentCharacteristics: any[];
    }>;
    private getStories;
    private getQueryConditionsFromFilters;
    private getGoalDataForSchool;
    private getIndicatorsFromStories;
    private addToIndicatorAggregator;
    private getColor;
    private sortResults;
}
