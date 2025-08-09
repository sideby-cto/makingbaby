"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromisingPraticeModule = void 0;
const common_1 = require("@nestjs/common");
const promising_pratice_service_1 = require("./promising-pratice.service");
const promising_pratice_controller_1 = require("./promising-pratice.controller");
const promising_pratice_entity_1 = require("./entities/promising-pratice.entity");
const mongoose_1 = require("@nestjs/mongoose");
let PromisingPraticeModule = class PromisingPraticeModule {
};
exports.PromisingPraticeModule = PromisingPraticeModule;
exports.PromisingPraticeModule = PromisingPraticeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: promising_pratice_entity_1.PromisingPractise.name, schema: promising_pratice_entity_1.PromisingPractiseSchema },
            ]),
        ],
        controllers: [promising_pratice_controller_1.PromisingPraticeController],
        providers: [promising_pratice_service_1.PromisingPraticeService],
    })
], PromisingPraticeModule);
//# sourceMappingURL=promising-pratice.module.js.map