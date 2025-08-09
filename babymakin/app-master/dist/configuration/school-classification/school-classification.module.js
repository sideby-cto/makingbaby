"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolClassificationModule = void 0;
const common_1 = require("@nestjs/common");
const school_classification_service_1 = require("./school-classification.service");
const school_classification_controller_1 = require("./school-classification.controller");
const mongoose_1 = require("@nestjs/mongoose");
const school_classification_entity_1 = require("./entities/school-classification.entity");
let SchoolClassificationModule = class SchoolClassificationModule {
};
exports.SchoolClassificationModule = SchoolClassificationModule;
exports.SchoolClassificationModule = SchoolClassificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: school_classification_entity_1.SchoolClassification.name, schema: school_classification_entity_1.SchoolClassificationSchema },
            ]),
        ],
        controllers: [school_classification_controller_1.SchoolClassificationController],
        providers: [school_classification_service_1.SchoolClassificationService],
    })
], SchoolClassificationModule);
//# sourceMappingURL=school-classification.module.js.map