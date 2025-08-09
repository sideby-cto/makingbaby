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
exports.GoalService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const goal_entity_1 = require("./entities/goal.entity");
let GoalService = class GoalService {
    constructor(goalModel) {
        this.goalModel = goalModel;
    }
    create(createGoalDto) {
        const createdGoal = new this.goalModel(createGoalDto);
        return createdGoal.save();
    }
    findAll() {
        return this.goalModel.find({});
    }
    findOne(id) {
        return this.goalModel.findById(id);
    }
    update(id, updateGoalDto) {
        return this.goalModel.findByIdAndUpdate(id, updateGoalDto);
    }
    remove(id) {
        return this.goalModel.findByIdAndRemove(id);
    }
};
exports.GoalService = GoalService;
exports.GoalService = GoalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(goal_entity_1.Goal.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GoalService);
//# sourceMappingURL=goal.service.js.map