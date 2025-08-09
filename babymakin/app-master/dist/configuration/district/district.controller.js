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
exports.DistrictController = void 0;
const common_1 = require("@nestjs/common");
const district_service_1 = require("./district.service");
const create_district_dto_1 = require("./dto/create-district.dto");
const update_district_dto_1 = require("./dto/update-district.dto");
let DistrictController = class DistrictController {
    constructor(districtService) {
        this.districtService = districtService;
    }
    create(createDistrictDto) {
        return this.districtService.create(createDistrictDto);
    }
    async getSchoolsForDistrict(districtId) {
        return this.districtService.getSchoolsForDistrict(districtId);
    }
    findAll() {
        return this.districtService.findAll();
    }
    findOne(id) {
        return this.districtService.findOne(id);
    }
    getStudentCharatertices(id) {
        return this.districtService.getStudentCharateriticsForDistrict(id);
    }
    getPromisingPractise(id) {
        return this.districtService.getPromisingPractiseForDistrict(id);
    }
    getSuccessSigns(id) {
        return this.districtService.getSuccessSignForDistrict(id);
    }
    update(id, updateDistrictDto) {
        return this.districtService.update(id, updateDistrictDto);
    }
    remove(id) {
        return this.districtService.remove(id);
    }
};
exports.DistrictController = DistrictController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_district_dto_1.CreateDistrictDto]),
    __metadata("design:returntype", void 0)
], DistrictController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/schools'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DistrictController.prototype, "getSchoolsForDistrict", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DistrictController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DistrictController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/studentcharateritices'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DistrictController.prototype, "getStudentCharatertices", null);
__decorate([
    (0, common_1.Get)(':id/promisingpractise'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DistrictController.prototype, "getPromisingPractise", null);
__decorate([
    (0, common_1.Get)(':id/successsigns'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DistrictController.prototype, "getSuccessSigns", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_district_dto_1.UpdateDistrictDto]),
    __metadata("design:returntype", void 0)
], DistrictController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DistrictController.prototype, "remove", null);
exports.DistrictController = DistrictController = __decorate([
    (0, common_1.Controller)('districts'),
    __metadata("design:paramtypes", [district_service_1.DistrictService])
], DistrictController);
//# sourceMappingURL=district.controller.js.map