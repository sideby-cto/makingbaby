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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistrictSchema = exports.District = exports.DistrictGoalSchema = exports.DistrictGoal = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const organization_entity_1 = require("../../organization/entities/organization.entity");
const goal_entity_1 = require("../../goal/entities/goal.entity");
const promising_pratice_entity_1 = require("../../promising-pratice/entities/promising-pratice.entity");
const student_charactice_entity_1 = require("../../student-charactice/entities/student-charactice.entity");
const student_success_sign_entity_1 = require("../../student-success-sign/entities/student-success-sign.entity");
let DistrictGoal = class DistrictGoal extends mongoose_2.Document {
};
exports.DistrictGoal = DistrictGoal;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: goal_entity_1.Goal.name,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DistrictGoal.prototype, "goal", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        default: [],
        ref: promising_pratice_entity_1.PromisingPractise.name,
    }),
    __metadata("design:type", Array)
], DistrictGoal.prototype, "promisingPractices", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        default: [],
        ref: student_success_sign_entity_1.StudentSuccessSign.name,
    }),
    __metadata("design:type", Array)
], DistrictGoal.prototype, "successSigns", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        default: [],
        ref: student_charactice_entity_1.StudentCharactice.name,
    }),
    __metadata("design:type", Array)
], DistrictGoal.prototype, "studentCharacteristics", void 0);
exports.DistrictGoal = DistrictGoal = __decorate([
    (0, mongoose_1.Schema)()
], DistrictGoal);
exports.DistrictGoalSchema = mongoose_1.SchemaFactory.createForClass(DistrictGoal);
let District = class District {
};
exports.District = District;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], District.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: organization_entity_1.Organization.name }),
    __metadata("design:type", organization_entity_1.Organization)
], District.prototype, "organization", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.DistrictGoalSchema], default: [] }),
    __metadata("design:type", Array)
], District.prototype, "districtGoals", void 0);
exports.District = District = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], District);
exports.DistrictSchema = mongoose_1.SchemaFactory.createForClass(District);
//# sourceMappingURL=district.entity.js.map