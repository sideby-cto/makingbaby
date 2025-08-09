"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationModule = void 0;
const common_1 = require("@nestjs/common");
const school_module_1 = require("./school/school.module");
const school_classification_module_1 = require("./school-classification/school-classification.module");
const district_module_1 = require("./district/district.module");
const goal_module_1 = require("./goal/goal.module");
const team_module_1 = require("./team/team.module");
const organization_module_1 = require("./organization/organization.module");
const promising_pratice_module_1 = require("./promising-pratice/promising-pratice.module");
const student_success_sign_module_1 = require("./student-success-sign/student-success-sign.module");
const student_charactice_module_1 = require("./student-charactice/student-charactice.module");
let ConfigurationModule = class ConfigurationModule {
};
exports.ConfigurationModule = ConfigurationModule;
exports.ConfigurationModule = ConfigurationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            school_module_1.SchoolModule,
            school_classification_module_1.SchoolClassificationModule,
            district_module_1.DistrictModule,
            goal_module_1.GoalModule,
            team_module_1.TeamModule,
            organization_module_1.OrganizationModule,
            promising_pratice_module_1.PromisingPraticeModule,
            student_success_sign_module_1.StudentSuccessSignModule,
            student_charactice_module_1.StudentCharacticeModule,
        ],
    })
], ConfigurationModule);
//# sourceMappingURL=configuration.module.js.map