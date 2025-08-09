"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentCharacticeModule = void 0;
const common_1 = require("@nestjs/common");
const student_charactice_service_1 = require("./student-charactice.service");
const student_charactice_controller_1 = require("./student-charactice.controller");
const student_charactice_entity_1 = require("./entities/student-charactice.entity");
const mongoose_1 = require("@nestjs/mongoose");
let StudentCharacticeModule = class StudentCharacticeModule {
};
exports.StudentCharacticeModule = StudentCharacticeModule;
exports.StudentCharacticeModule = StudentCharacticeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: student_charactice_entity_1.StudentCharactice.name, schema: student_charactice_entity_1.StudentCharacticeSchema },
            ]),
        ],
        controllers: [student_charactice_controller_1.StudentCharacticeController],
        providers: [student_charactice_service_1.StudentCharacticeService],
    })
], StudentCharacticeModule);
//# sourceMappingURL=student-charactice.module.js.map