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
exports.SchoolService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const promising_pratice_entity_1 = require("../promising-pratice/entities/promising-pratice.entity");
const student_charactice_entity_1 = require("../student-charactice/entities/student-charactice.entity");
const student_success_sign_entity_1 = require("../student-success-sign/entities/student-success-sign.entity");
const school_entity_1 = require("./entities/school.entity");
let SchoolService = class SchoolService {
    constructor(schoolModel, studentCharacticeModel, promisingPracticeModel, successSigneModel) {
        this.schoolModel = schoolModel;
        this.studentCharacticeModel = studentCharacticeModel;
        this.promisingPracticeModel = promisingPracticeModel;
        this.successSigneModel = successSigneModel;
    }
    async create(createSchoolDto) {
        const existingSchoolForDistrict = await this.schoolModel
            .exists({
            $and: [
                { name: createSchoolDto.name },
                { district: createSchoolDto.district },
            ],
        })
            .exec();
        if (existingSchoolForDistrict) {
            throw new common_1.BadRequestException('A school with this name already exists for this district');
        }
        if (createSchoolDto.schoolClassification === '')
            createSchoolDto.schoolClassification = null;
        const createdSchool = new this.schoolModel(createSchoolDto);
        return createdSchool.save();
    }
    findAll() {
        return this.schoolModel
            .find({})
            .populate('schoolClassification')
            .populate('district')
            .populate('schoolGoals.goal')
            .populate('schoolGoals.promisingPractices')
            .populate('schoolGoals.successSigns')
            .populate('schoolGoals.studentCharacteristics');
    }
    findOne(id) {
        return this.schoolModel
            .findById(id)
            .populate('schoolClassification')
            .populate('district')
            .populate('schoolGoals.goal')
            .populate('schoolGoals.promisingPractices')
            .populate('schoolGoals.successSigns')
            .populate('schoolGoals.studentCharacteristics');
    }
    update(id, updateSchoolDto) {
        if (updateSchoolDto.schoolClassification === '')
            updateSchoolDto.schoolClassification = null;
        return this.schoolModel.findByIdAndUpdate(id, updateSchoolDto);
    }
    remove(id) {
        return this.schoolModel.findByIdAndRemove(id);
    }
    getSchoolsForDistrict(districtId) {
        return this.schoolModel
            .find({ district: districtId.toString() })
            .populate('schoolClassification')
            .populate('district')
            .populate('schoolGoals.goal')
            .populate('schoolGoals.promisingPractices')
            .populate('schoolGoals.successSigns')
            .populate('schoolGoals.studentCharacteristics');
    }
    async getStudentCharateriticsForSchool(schoolId) {
        const distinctIds = await this.schoolModel
            .distinct('schoolGoals.studentCharacteristics', { _id: schoolId })
            .exec();
        return this.studentCharacticeModel.find({ _id: { $in: distinctIds } });
    }
    async getPromisingPractiseForSchool(schoolId) {
        const distinctIds = await this.schoolModel
            .distinct('schoolGoals.promisingPractices', { _id: schoolId })
            .exec();
        return this.promisingPracticeModel.find({ _id: { $in: distinctIds } });
    }
    async getSuccessSignForSchool(schoolId) {
        const distinctIds = await this.schoolModel
            .distinct('schoolGoals.successSigns', { _id: schoolId })
            .exec();
        return this.successSigneModel.find({ _id: { $in: distinctIds } });
    }
};
exports.SchoolService = SchoolService;
exports.SchoolService = SchoolService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(school_entity_1.School.name)),
    __param(1, (0, mongoose_1.InjectModel)(student_charactice_entity_1.StudentCharactice.name)),
    __param(2, (0, mongoose_1.InjectModel)(promising_pratice_entity_1.PromisingPractise.name)),
    __param(3, (0, mongoose_1.InjectModel)(student_success_sign_entity_1.StudentSuccessSign.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SchoolService);
//# sourceMappingURL=school.service.js.map