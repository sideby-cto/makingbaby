"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_controller_1 = require("./dashboard.controller");
const story_module_1 = require("../story/story.module");
const mongoose_1 = require("@nestjs/mongoose");
const story_entity_1 = require("../story/entities/story.entity");
const school_entity_1 = require("../configuration/school/entities/school.entity");
const district_service_1 = require("../configuration/district/district.service");
const district_entity_1 = require("../configuration/district/entities/district.entity");
const school_service_1 = require("../configuration/school/school.service");
const student_charactice_entity_1 = require("../configuration/student-charactice/entities/student-charactice.entity");
const promising_pratice_entity_1 = require("../configuration/promising-pratice/entities/promising-pratice.entity");
const student_success_sign_entity_1 = require("../configuration/student-success-sign/entities/student-success-sign.entity");
const team_service_1 = require("../configuration/team/team.service");
const team_entity_1 = require("../configuration/team/entities/team.entity");
const user_service_1 = require("../user/user.service");
const user_entity_1 = require("../user/entities/user.entity");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            story_module_1.StoryModule,
            mongoose_1.MongooseModule.forFeature([
                { name: story_entity_1.Story.name, schema: story_entity_1.StorySchema },
                { name: school_entity_1.School.name, schema: school_entity_1.SchoolSchema },
                { name: district_entity_1.District.name, schema: district_entity_1.DistrictSchema },
                { name: student_charactice_entity_1.StudentCharactice.name, schema: student_charactice_entity_1.StudentCharacticeSchema },
                { name: promising_pratice_entity_1.PromisingPractise.name, schema: promising_pratice_entity_1.PromisingPractiseSchema },
                { name: student_success_sign_entity_1.StudentSuccessSign.name, schema: student_success_sign_entity_1.StudentSuccessSignSchema },
                { name: team_entity_1.Team.name, schema: team_entity_1.TeamSchema },
                { name: user_entity_1.User.name, schema: user_entity_1.UserSchema },
            ]),
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService, school_service_1.SchoolService, team_service_1.TeamService, user_service_1.UserService, district_service_1.DistrictService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map