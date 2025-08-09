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
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("../../user/entities/user.entity");
const district_entity_1 = require("../district/entities/district.entity");
const school_entity_1 = require("../school/entities/school.entity");
const team_entity_1 = require("./entities/team.entity");
let TeamService = class TeamService {
    constructor(teamModel, userModel, districtModel, schoolModel) {
        this.teamModel = teamModel;
        this.userModel = userModel;
        this.districtModel = districtModel;
        this.schoolModel = schoolModel;
    }
    async create(createTeamDto) {
        const existingTeamForSchool = await this.teamModel
            .exists({
            $and: [{ name: createTeamDto.name }, { school: createTeamDto.school }],
        })
            .exec();
        if (existingTeamForSchool) {
            throw new common_1.BadRequestException('A team with this name already exists for this school');
        }
        const createdTeam = new this.teamModel(createTeamDto);
        return createdTeam.save();
    }
    findAll() {
        return this.teamModel
            .find({})
            .populate('school')
            .populate('teamGoals.goal')
            .populate('teamGoals.promisingPractices')
            .populate('teamGoals.successSigns')
            .populate('teamGoals.studentCharacteristics');
    }
    findOne(id) {
        return this.teamModel
            .findById(id)
            .populate('school')
            .populate('teamGoals.goal')
            .populate('teamGoals.promisingPractices')
            .populate('teamGoals.successSigns')
            .populate('teamGoals.studentCharacteristics');
    }
    update(id, updateTeamDto) {
        return this.teamModel.findByIdAndUpdate(id, updateTeamDto);
    }
    remove(id) {
        return this.teamModel.findByIdAndRemove(id);
    }
    async getGoalDataForTeam(goal, teamId) {
        const team = await this.teamModel
            .findById(teamId)
            .select('school')
            .lean()
            .exec();
        const schoolId = team === null || team === void 0 ? void 0 : team.school;
        const schoolGoals = await this.schoolModel
            .findById(schoolId)
            .select('schoolGoals')
            .lean()
            .exec();
        const output = schoolGoals === null || schoolGoals === void 0 ? void 0 : schoolGoals.schoolGoals.find((x) => x.goal._id === goal);
        return { teamGoal: output, schoolId };
    }
    async findUsersForTeam(teamId) {
        const teamUsers = await this.userModel
            .find({ teams: teamId })
            .select(['_id'])
            .exec();
        const ids = teamUsers.map((x) => x._id.toString());
        return ids;
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(team_entity_1.Team.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(district_entity_1.District.name)),
    __param(3, (0, mongoose_1.InjectModel)(school_entity_1.School.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], TeamService);
//# sourceMappingURL=team.service.js.map