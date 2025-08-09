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
exports.StudentSuccessSignController = void 0;
const common_1 = require("@nestjs/common");
const student_success_sign_service_1 = require("./student-success-sign.service");
const create_student_success_sign_dto_1 = require("./dto/create-student-success-sign.dto");
const update_student_success_sign_dto_1 = require("./dto/update-student-success-sign.dto");
let StudentSuccessSignController = class StudentSuccessSignController {
    constructor(studentSuccessSignService) {
        this.studentSuccessSignService = studentSuccessSignService;
    }
    create(createStudentSuccessSignDto) {
        return this.studentSuccessSignService.create(createStudentSuccessSignDto);
    }
    findAll() {
        return this.studentSuccessSignService.findAll();
    }
    findOne(id) {
        return this.studentSuccessSignService.findOne(id);
    }
    update(id, updateStudentSuccessSignDto) {
        return this.studentSuccessSignService.update(id, updateStudentSuccessSignDto);
    }
    remove(id) {
        return this.studentSuccessSignService.remove(id);
    }
};
exports.StudentSuccessSignController = StudentSuccessSignController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_success_sign_dto_1.CreateStudentSuccessSignDto]),
    __metadata("design:returntype", void 0)
], StudentSuccessSignController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudentSuccessSignController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentSuccessSignController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_success_sign_dto_1.UpdateStudentSuccessSignDto]),
    __metadata("design:returntype", void 0)
], StudentSuccessSignController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StudentSuccessSignController.prototype, "remove", null);
exports.StudentSuccessSignController = StudentSuccessSignController = __decorate([
    (0, common_1.Controller)('student-success-sign'),
    __metadata("design:paramtypes", [student_success_sign_service_1.StudentSuccessSignService])
], StudentSuccessSignController);
//# sourceMappingURL=student-success-sign.controller.js.map