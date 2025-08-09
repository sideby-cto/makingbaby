"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistrictModule = void 0;
const common_1 = require("@nestjs/common");
const district_service_1 = require("./district.service");
const district_controller_1 = require("./district.controller");
const mongoose_1 = require("@nestjs/mongoose");
const district_entity_1 = require("./entities/district.entity");
const school_service_1 = require("../school/school.service");
const school_entity_1 = require("../school/entities/school.entity");
const student_charactice_entity_1 = require("../student-charactice/entities/student-charactice.entity");
const promising_pratice_entity_1 = require("../promising-pratice/entities/promising-pratice.entity");
const student_success_sign_entity_1 = require("../student-success-sign/entities/student-success-sign.entity");
let DistrictModule = class DistrictModule {
};
exports.DistrictModule = DistrictModule;
exports.DistrictModule = DistrictModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: district_entity_1.District.name, schema: district_entity_1.DistrictSchema },
                { name: school_entity_1.School.name, schema: school_entity_1.SchoolSchema },
                { name: student_charactice_entity_1.StudentCharactice.name, schema: student_charactice_entity_1.StudentCharacticeSchema },
                { name: promising_pratice_entity_1.PromisingPractise.name, schema: promising_pratice_entity_1.PromisingPractiseSchema },
                { name: student_success_sign_entity_1.StudentSuccessSign.name, schema: student_success_sign_entity_1.StudentSuccessSignSchema },
            ]),
        ],
        controllers: [district_controller_1.DistrictController],
        providers: [district_service_1.DistrictService, school_service_1.SchoolService],
        exports: [district_service_1.DistrictService],
    })
], DistrictModule);
//# sourceMappingURL=district.module.js.map