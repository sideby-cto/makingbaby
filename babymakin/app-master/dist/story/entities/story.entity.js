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
exports.StorySchema = exports.Story = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const district_entity_1 = require("../../configuration/district/entities/district.entity");
const promising_pratice_entity_1 = require("../../configuration/promising-pratice/entities/promising-pratice.entity");
const school_entity_1 = require("../../configuration/school/entities/school.entity");
const student_charactice_entity_1 = require("../../configuration/student-charactice/entities/student-charactice.entity");
const student_success_sign_entity_1 = require("../../configuration/student-success-sign/entities/student-success-sign.entity");
const user_entity_1 = require("../../user/entities/user.entity");
let Story = class Story {
};
exports.Story = Story;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Story.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: user_entity_1.User.name,
    }),
    __metadata("design:type", String)
], Story.prototype, "author", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: user_entity_1.User.name,
    }),
    __metadata("design:type", String)
], Story.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Story.prototype, "storyAction", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Story.prototype, "likes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Story.prototype, "high5s", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Story.prototype, "Insighfuls", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Story.prototype, "storyExperience", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Story.prototype, "storyObservation", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        default: [],
        ref: student_success_sign_entity_1.StudentSuccessSign.name,
    }),
    __metadata("design:type", Array)
], Story.prototype, "successSigns", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        default: [],
        ref: student_charactice_entity_1.StudentCharactice.name,
    }),
    __metadata("design:type", Array)
], Story.prototype, "studentCharacteristics", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        default: [],
        ref: promising_pratice_entity_1.PromisingPractise.name,
    }),
    __metadata("design:type", Array)
], Story.prototype, "promisingPractices", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        default: [],
        ref: 'StoryFile',
    }),
    __metadata("design:type", Array)
], Story.prototype, "files", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: district_entity_1.District.name }),
    __metadata("design:type", district_entity_1.District)
], Story.prototype, "district", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: school_entity_1.School.name }),
    __metadata("design:type", school_entity_1.School)
], Story.prototype, "school", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        default: [],
        ref: user_entity_1.User.name,
    }),
    __metadata("design:type", Array)
], Story.prototype, "taggedUsersId", void 0);
exports.Story = Story = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Story);
exports.StorySchema = mongoose_1.SchemaFactory.createForClass(Story);
//# sourceMappingURL=story.entity.js.map