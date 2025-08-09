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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_decode_1 = require("jwt-decode");
const school_entity_1 = require("../configuration/school/entities/school.entity");
const school_service_1 = require("../configuration/school/school.service");
const team_service_1 = require("../configuration/team/team.service");
const user_service_1 = require("../user/user.service");
const story_entity_1 = require("../story/entities/story.entity");
function getUserIdFromToken(token) {
    const decodedToken = (0, jwt_decode_1.default)(token);
    return decodedToken.sub || '';
}
let DashboardService = class DashboardService {
    constructor(model, schoolModel, schoolService, teamService, userService) {
        this.model = model;
        this.schoolModel = schoolModel;
        this.schoolService = schoolService;
        this.teamService = teamService;
        this.userService = userService;
        this.COLORS = [
            '#678293',
            '#B9BDC8',
            '#DDCABB',
            '#DCB13C',
            '#57BDA2',
            '#2493A2',
            '#304A78',
            '#2C3259',
        ];
    }
    async getDashboardData(filter) {
        const stories = await this.getStories(filter);
        const { successSigns, promisingPractices, studentCharacteristics, } = await this.getIndicatorsFromStories(stories, filter);
        return {
            stories,
            successSigns,
            promisingPractices,
            studentCharacteristics,
        };
    }
    async getStories(filter) {
        const queryConditions = await this.getQueryConditionsFromFilters(filter);
        if (queryConditions === null)
            return [];
        return this.model
            .find({ $and: queryConditions })
            .sort({ createdAt: -1 })
            .populate('successSigns')
            .populate('studentCharacteristics')
            .populate('promisingPractices')
            .populate('author')
            .populate('files', 'url')
            .lean()
            .exec();
    }
    async getQueryConditionsFromFilters(filter) {
        var _a;
        const conditions = [];
        let schools = [];
        const loggedInUserId = getUserIdFromToken(filter.userToken);
        const loggedInUser = await this.userService.findOne(loggedInUserId);
        if ((loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.permissionLevel) !== 'Admin' || filter.district || filter.school) {
            if (filter.school) {
                if (filter.school.startsWith('scid_')) {
                    const schoolClassificationId = filter.school.substring(5);
                    let schoolList = [];
                    if (filter.district) {
                        schoolList = await this.schoolService.getSchoolsForDistrict(filter.district);
                    }
                    else if (loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.schools.length) {
                        schoolList = loggedInUser.schools;
                    }
                    const schoolsInClassification = schoolList.filter((x) => { var _a; return ((_a = x.schoolClassification) === null || _a === void 0 ? void 0 : _a._id.toString()) === schoolClassificationId; });
                    if (!schoolsInClassification.length)
                        return null;
                    schools = schoolsInClassification.map((x) => x._id);
                }
                else {
                    schools.push(filter.school);
                }
            }
            else if (filter.district) {
                const schoolsInDistrict = await this.schoolService.getSchoolsForDistrict(filter.district);
                if (!(schoolsInDistrict === null || schoolsInDistrict === void 0 ? void 0 : schoolsInDistrict.length))
                    return null;
                schools = schoolsInDistrict.map((x) => x._id);
            }
            else {
                if (!((_a = loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.schools) === null || _a === void 0 ? void 0 : _a.length)) {
                    return null;
                }
                schools = loggedInUser.schools.map((x) => x._id);
            }
            conditions.push({ school: { $in: schools } });
        }
        if (filter.userId) {
            if (filter.userId !== loggedInUserId) {
                conditions.push({ author: { $ne: null } });
            }
            ;
            conditions.push({ $or: [{ author: filter.userId }, { userId: filter.userId }, { taggedUsersId: filter.userId }] });
        }
        else if (filter.team) {
            const userIds = await this.teamService.findUsersForTeam(filter.team);
            if (!userIds.length)
                return null;
            conditions.push({ $or: [{ author: { $in: userIds } }, { userId: { $in: userIds } }, { taggedUsersId: { $in: userIds } }] });
        }
        if (filter.goal) {
            const goalSuccessSigns = [];
            for (const schoolId of schools) {
                const schoolGoal = await this.getGoalDataForSchool(filter.goal, schoolId);
                if (schoolGoal)
                    goalSuccessSigns.push(...schoolGoal.successSigns);
            }
            if (!goalSuccessSigns.length)
                return null;
            conditions.push({ successSigns: { $in: goalSuccessSigns } });
        }
        if (filter.successSign) {
            conditions.push({ successSigns: filter.successSign });
        }
        if (filter.promisingPractices) {
            conditions.push({ promisingPractices: filter.promisingPractices });
        }
        if (filter.studentCharacteristics) {
            conditions.push({ studentCharacteristics: filter.studentCharacteristics });
        }
        if (filter.from && filter.to) {
            const fromDate = new Date(filter.from);
            const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
            const toDate = new Date(filter.to);
            const to = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 1);
            conditions.push({ createdAt: { $gte: from, $lte: to } });
        }
        if (filter.storyType) {
            conditions.push({ type: filter.storyType });
        }
        return conditions;
    }
    async getGoalDataForSchool(goalId, schoolId) {
        const result = await this.schoolModel
            .findOne({ _id: schoolId })
            .select('schoolGoals')
            .lean()
            .exec();
        return result === null || result === void 0 ? void 0 : result.schoolGoals.find((x) => x.goal._id === goalId);
    }
    getIndicatorsFromStories(stories, filter) {
        let successSignAggregator = {};
        let promisingPracticeAggregator = {};
        let studentCharacteristicAggregator = {};
        stories.forEach((story) => {
            story.successSigns.forEach((successSign) => {
                this.addToIndicatorAggregator(successSign, successSignAggregator, filter.successSign);
            });
            story.promisingPractices.forEach((promisingPractice) => {
                this.addToIndicatorAggregator(promisingPractice, promisingPracticeAggregator, filter.promisingPractices);
            });
            story.studentCharacteristics.forEach((studentCharacteristic) => {
                this.addToIndicatorAggregator(studentCharacteristic, studentCharacteristicAggregator, filter.studentCharacteristics);
            });
        });
        const successSigns = this.sortResults(Object.values(successSignAggregator), 'name');
        const promisingPractices = this.sortResults(Object.values(promisingPracticeAggregator), 'name');
        const studentCharacteristics = this.sortResults(Object.values(studentCharacteristicAggregator), 'name');
        const chooser = this.getColor(this.COLORS);
        successSigns.forEach((obj) => { obj.color = chooser(); });
        promisingPractices.forEach((obj) => { obj.color = chooser(); });
        studentCharacteristics.forEach((obj) => { obj.color = chooser(); });
        return {
            successSigns,
            promisingPractices,
            studentCharacteristics,
        };
    }
    addToIndicatorAggregator(indicator, aggregatorObject, filterId) {
        if (filterId && !indicator._id.equals(filterId))
            return;
        if (!aggregatorObject[indicator._id]) {
            aggregatorObject[indicator._id] = {
                value: 1,
                name: indicator.name,
                id: indicator._id,
            };
        }
        else {
            aggregatorObject[indicator._id].value++;
        }
    }
    getColor(array) {
        let index = 0;
        return function () {
            if (index >= array.length) {
                index = 0;
            }
            const color = array[index];
            index++;
            return color;
        };
    }
    sortResults(array, property) {
        const sortedResult = array.sort((a, b) => {
            const valueA = a[property].toLowerCase();
            const valueB = b[property].toLowerCase();
            let i = 0;
            while (valueA[i] === valueB[i]) {
                i++;
            }
            return valueA[i].localeCompare(valueB[i]);
        });
        return sortedResult;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(story_entity_1.Story.name)),
    __param(1, (0, mongoose_1.InjectModel)(school_entity_1.School.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        school_service_1.SchoolService,
        team_service_1.TeamService,
        user_service_1.UserService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map