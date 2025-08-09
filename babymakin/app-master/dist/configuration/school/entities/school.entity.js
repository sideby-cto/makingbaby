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
exports.SchoolSchema = exports.School = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const district_entity_1 = require("../../district/entities/district.entity");
const school_classification_entity_1 = require("../../school-classification/entities/school-classification.entity");
let School = class School {
};
exports.School = School;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], School.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: school_classification_entity_1.SchoolClassification.name }),
    __metadata("design:type", school_classification_entity_1.SchoolClassification)
], School.prototype, "schoolClassification", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: district_entity_1.District.name }),
    __metadata("design:type", district_entity_1.District)
], School.prototype, "district", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [district_entity_1.DistrictGoalSchema], default: [] }),
    __metadata("design:type", Array)
], School.prototype, "schoolGoals", void 0);
exports.School = School = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], School);
exports.SchoolSchema = mongoose_1.SchemaFactory.createForClass(School);
//# sourceMappingURL=school.entity.js.map