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
exports.DistrictService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const promising_pratice_entity_1 = require("../promising-pratice/entities/promising-pratice.entity");
const school_service_1 = require("../school/school.service");
const student_charactice_entity_1 = require("../student-charactice/entities/student-charactice.entity");
const student_success_sign_entity_1 = require("../student-success-sign/entities/student-success-sign.entity");
const district_entity_1 = require("./entities/district.entity");
let DistrictService = class DistrictService {
    constructor(districtModel, schoolService, studentCharacticeModel, promisingPracticeModel, successSigneModel) {
        this.districtModel = districtModel;
        this.schoolService = schoolService;
        this.studentCharacticeModel = studentCharacticeModel;
        this.promisingPracticeModel = promisingPracticeModel;
        this.successSigneModel = successSigneModel;
    }
    async create(createDistrictDto) {
        const existingId = await this.districtModel.exists({
            name: createDistrictDto.name,
        });
        if (existingId) {
            throw new common_1.BadRequestException('A district with this name already exists');
        }
        if (createDistrictDto.organization === '')
            createDistrictDto.organization = null;
        const createdDistrict = new this.districtModel(createDistrictDto);
        return createdDistrict.save();
    }
    findAll() {
        return this.districtModel
            .find({})
            .populate('organization')
            .populate('districtGoals.goal')
            .populate('districtGoals.promisingPractices')
            .populate('districtGoals.successSigns')
            .populate('districtGoals.studentCharacteristics');
    }
    findOne(id) {
        return this.districtModel
            .findById(id)
            .populate('organization')
            .populate('districtGoals.goal')
            .populate('districtGoals.promisingPractices')
            .populate('districtGoals.successSigns')
            .populate('districtGoals.studentCharacteristics');
    }
    update(id, updateDistrictDto) {
        if (updateDistrictDto.organization === '')
            updateDistrictDto.organization = null;
        return this.districtModel.findByIdAndUpdate(id, updateDistrictDto);
    }
    remove(id) {
        return this.districtModel.findByIdAndRemove(id);
    }
    getSchoolsForDistrict(districtId) {
        return this.schoolService.getSchoolsForDistrict(districtId);
    }
    getDistrictsForOrganization(organizationId) {
        return this.districtModel
            .find({ organization: organizationId.toString() });
    }
    async getStudentCharateriticsForDistrict(districtId) {
        const distinctIds = await this.districtModel
            .distinct('districtGoals.studentCharacteristics', { _id: districtId })
            .exec();
        return this.studentCharacticeModel.find({ _id: { $in: distinctIds } });
    }
    async getPromisingPractiseForDistrict(districtId) {
        const distinctIds = await this.districtModel
            .distinct('districtGoals.promisingPractices', { _id: districtId })
            .exec();
        return this.promisingPracticeModel.find({ _id: { $in: distinctIds } });
    }
    async getSuccessSignForDistrict(districtId) {
        const distinctIds = await this.districtModel
            .distinct('districtGoals.successSigns', { _id: districtId })
            .exec();
        return this.successSigneModel.find({ _id: { $in: distinctIds } });
    }
};
exports.DistrictService = DistrictService;
exports.DistrictService = DistrictService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(district_entity_1.District.name)),
    __param(2, (0, mongoose_1.InjectModel)(student_charactice_entity_1.StudentCharactice.name)),
    __param(3, (0, mongoose_1.InjectModel)(promising_pratice_entity_1.PromisingPractise.name)),
    __param(4, (0, mongoose_1.InjectModel)(student_success_sign_entity_1.StudentSuccessSign.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        school_service_1.SchoolService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DistrictService);
//# sourceMappingURL=district.service.js.map