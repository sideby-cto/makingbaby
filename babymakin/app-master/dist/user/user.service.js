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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_decorators_1 = require("@nestjs/mongoose/dist/common/mongoose.decorators");
const mongoose_1 = require("mongoose");
const user_entity_1 = require("./entities/user.entity");
const district_service_1 = require("../configuration/district/district.service");
const school_service_1 = require("../configuration/school/school.service");
function getUserOutput(output) {
    output = output ? output : {};
    return {
        name: output.name,
        email: output.email,
        schools: output.schools,
        permissionLevel: output.permissionLevel,
        teams: output.teams,
        id: output._id,
        district: output.district,
        organization: output.organization,
        inactive: output.inactive,
    };
}
let UserService = class UserService {
    constructor(userModel, districtService, schoolService) {
        this.userModel = userModel;
        this.districtService = districtService;
        this.schoolService = schoolService;
    }
    async create(createUserDto) {
        const existingId = await this.userModel.exists({
            email: createUserDto.email,
        });
        if (existingId) {
            throw new common_1.BadRequestException('A user with this email address already exists');
        }
        const createdUser = new this.userModel(createUserDto);
        const user = await createdUser.save();
        const output = getUserOutput(user);
        return new Promise((resolve, reject) => {
            return resolve(output);
        });
    }
    async findAll(input) {
        let query = {};
        if (input.filter) {
            query = {
                $or: [
                    { name: { $regex: input.filter, $options: 'i' } },
                    { email: { $regex: input.filter, $options: 'i' } },
                    { permissionLevel: { $regex: input.filter, $options: 'i' } },
                    { 'organization.name': { $regex: input.filter, $options: 'i' } },
                    { 'district.name': { $regex: input.filter, $options: 'i' } },
                    { 'schools.name': { $regex: input.filter, $options: 'i' } },
                ],
            };
        }
        const users = await this.userModel
            .find(query)
            .sort({ _id: 1 })
            .skip(input.currentPage * input.pageSize)
            .limit(input.pageSize)
            .populate({
            path: 'schools',
            populate: [
                {
                    path: 'schoolGoals',
                    model: 'DistrictGoal',
                    populate: [
                        {
                            path: 'promisingPractices',
                            model: 'PromisingPractise',
                        },
                        {
                            path: 'successSigns',
                            model: 'StudentSuccessSign',
                        },
                        {
                            path: 'studentCharacteristics',
                            model: 'StudentCharactice',
                        },
                    ],
                },
                {
                    path: 'schoolClassification',
                    model: 'SchoolClassification',
                },
            ],
        })
            .populate({
            path: 'district',
            populate: {
                path: 'districtGoals',
                model: 'DistrictGoal',
                populate: [
                    {
                        path: 'promisingPractices',
                        model: 'PromisingPractise',
                    },
                    {
                        path: 'successSigns',
                        model: 'StudentSuccessSign',
                    },
                    {
                        path: 'studentCharacteristics',
                        model: 'StudentCharactice',
                    },
                    {
                        path: 'goal',
                        model: 'Goal',
                    },
                ],
            },
        })
            .populate('mainTeam')
            .populate('teams')
            .populate('organization');
        return users.map((x) => getUserOutput(x));
    }
    async findOne(id) {
        const user = await this.userModel
            .findById(id)
            .populate({
            path: 'district',
            populate: {
                path: 'districtGoals',
                model: 'DistrictGoal',
                populate: [
                    {
                        path: 'promisingPractices',
                        model: 'PromisingPractise',
                    },
                    {
                        path: 'successSigns',
                        model: 'StudentSuccessSign',
                    },
                    {
                        path: 'studentCharacteristics',
                        model: 'StudentCharactice',
                    },
                    {
                        path: 'goal',
                        model: 'Goal',
                    },
                ],
            },
        })
            .populate({
            path: 'schools',
            populate: [
                {
                    path: 'schoolGoals',
                    model: 'DistrictGoal',
                    populate: [
                        {
                            path: 'promisingPractices',
                            model: 'PromisingPractise',
                        },
                        {
                            path: 'successSigns',
                            model: 'StudentSuccessSign',
                        },
                        {
                            path: 'studentCharacteristics',
                            model: 'StudentCharactice',
                        },
                    ],
                },
                {
                    path: 'schoolClassification',
                    model: 'SchoolClassification',
                },
            ],
        })
            .populate('mainTeam')
            .populate('teams')
            .populate('organization');
        if (!user)
            return null;
        let organizationDistricts = [];
        let orgId = undefined;
        if (user.organization) {
            orgId = user.organization._id ? user.organization._id : user.organization;
        }
        if (orgId) {
            organizationDistricts = await this.districtService.getDistrictsForOrganization(orgId);
        }
        if (organizationDistricts.length) {
            for (const district of organizationDistricts) {
                const schools = await this.schoolService.getSchoolsForDistrict(district._id);
                user.schools.push(...schools);
            }
        }
        return getUserOutput(user);
    }
    update(id, updateUserDto) {
        return this.userModel.findByIdAndUpdate(id, updateUserDto);
    }
    remove(id) {
        return this.userModel.findByIdAndDelete(id);
    }
    async findUserByEmail(email) {
        const user = await this.userModel
            .findOne({ email })
            .populate({
            path: 'schools',
            populate: [
                {
                    path: 'schoolGoals',
                    model: 'DistrictGoal',
                    populate: [
                        {
                            path: 'promisingPractices',
                            model: 'PromisingPractise',
                        },
                        {
                            path: 'successSigns',
                            model: 'StudentSuccessSign',
                        },
                        {
                            path: 'studentCharacteristics',
                            model: 'StudentCharactice',
                        },
                    ],
                },
                {
                    path: 'schoolClassification',
                    model: 'SchoolClassification',
                },
            ],
        })
            .populate({
            path: 'district',
            populate: {
                path: 'districtGoals',
                model: 'DistrictGoal',
                populate: [
                    {
                        path: 'promisingPractices',
                        model: 'PromisingPractise',
                    },
                    {
                        path: 'successSigns',
                        model: 'StudentSuccessSign',
                    },
                    {
                        path: 'studentCharacteristics',
                        model: 'StudentCharactice',
                    },
                ],
            },
        })
            .populate('mainTeam')
            .populate('teams');
        return user;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_decorators_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_1.Model,
        district_service_1.DistrictService,
        school_service_1.SchoolService])
], UserService);
//# sourceMappingURL=user.service.js.map