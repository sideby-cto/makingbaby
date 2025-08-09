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
exports.PromisingPraticeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const promising_pratice_entity_1 = require("./entities/promising-pratice.entity");
let PromisingPraticeService = class PromisingPraticeService {
    constructor(promisingModel) {
        this.promisingModel = promisingModel;
    }
    create(createPromisingPraticeDto) {
        const model = new this.promisingModel(createPromisingPraticeDto);
        return model.save();
    }
    findAll() {
        return this.promisingModel.find({});
    }
    findOne(id) {
        return this.promisingModel.findById(id);
    }
    update(id, updatePromisingPraticeDto) {
        return this.promisingModel.findByIdAndUpdate(id, updatePromisingPraticeDto);
    }
    remove(id) {
        return this.promisingModel.findByIdAndRemove(id);
    }
};
exports.PromisingPraticeService = PromisingPraticeService;
exports.PromisingPraticeService = PromisingPraticeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(promising_pratice_entity_1.PromisingPractise.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PromisingPraticeService);
//# sourceMappingURL=promising-pratice.service.js.map