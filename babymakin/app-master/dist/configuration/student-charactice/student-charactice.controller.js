"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentCharacticeController = void 0;
const common_1 = require("@nestjs/common");
const student_charactice_service_1 = require("./student-charactice.service");
const create_student_charactice_dto_1 = require("./dto/create-student-charactice.dto");
const update_student_charactice_dto_1 = require("./dto/update-student-charactice.dto");
let StudentCharacticeController = class StudentCharacticeController {
    constructor(studentCharacticeService) {
        this.studentCharacticeService = studentCharacticeService;
    }
    create(createStudentCharacticeDto) {
        return this.studentCharacticeService.create(createStudentCharacticeDto);
    }
    findAll() {
        return this.studentCharacticeService.findAll();
    }
    findOne(id) {
        return this.studentCharacticeService.findOne(id);
    }
    update(id, updateStudentCharacticeDto) {
        return this.studentCharacticeService.update(id, updateStudentCharacticeDto);
    }
    remove(id) {
        return this.studentCharacticeService.remove(id);
    }
};
exports.StudentCharacticeController = StudentCharacticeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_charactice_dto_1.CreateStudentCharacticeDto]),
    __metadata("design:returntype", void 0)
], StudentCharacticeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudentCharacticeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentCharacticeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_charactice_dto_1.UpdateStudentCharacticeDto]),
    __metadata("design:returntype", void 0)
], StudentCharacticeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentCharacticeController.prototype, "remove", null);
exports.StudentCharacticeController = StudentCharacticeController = __decorate([
    (0, common_1.Controller)('student-characteristics'),
    __metadata("design:paramtypes", [student_charactice_service_1.StudentCharacticeService])
], StudentCharacticeController);
//# sourceMappingURL=student-charactice.controller.js.map