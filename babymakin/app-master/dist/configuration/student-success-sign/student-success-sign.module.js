"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentSuccessSignModule = void 0;
const common_1 = require("@nestjs/common");
const student_success_sign_service_1 = require("./student-success-sign.service");
const student_success_sign_controller_1 = require("./student-success-sign.controller");
const student_success_sign_entity_1 = require("./entities/student-success-sign.entity");
const mongoose_1 = require("@nestjs/mongoose");
let StudentSuccessSignModule = class StudentSuccessSignModule {
};
exports.StudentSuccessSignModule = StudentSuccessSignModule;
exports.StudentSuccessSignModule = StudentSuccessSignModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: student_success_sign_entity_1.StudentSuccessSign.name, schema: student_success_sign_entity_1.StudentSuccessSignSchema },
            ]),
        ],
        controllers: [student_success_sign_controller_1.StudentSuccessSignController],
        providers: [student_success_sign_service_1.StudentSuccessSignService],
    })
], StudentSuccessSignModule);
//# sourceMappingURL=student-success-sign.module.js.map