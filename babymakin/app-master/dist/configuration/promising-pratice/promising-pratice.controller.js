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
exports.PromisingPraticeController = void 0;
const common_1 = require("@nestjs/common");
const promising_pratice_service_1 = require("./promising-pratice.service");
const create_promising_pratice_dto_1 = require("./dto/create-promising-pratice.dto");
const update_promising_pratice_dto_1 = require("./dto/update-promising-pratice.dto");
let PromisingPraticeController = class PromisingPraticeController {
    constructor(promisingPraticeService) {
        this.promisingPraticeService = promisingPraticeService;
    }
    create(createPromisingPraticeDto) {
        return this.promisingPraticeService.create(createPromisingPraticeDto);
    }
    findAll() {
        return this.promisingPraticeService.findAll();
    }
    findOne(id) {
        return this.promisingPraticeService.findOne(id);
    }
    update(id, updatePromisingPraticeDto) {
        return this.promisingPraticeService.update(id, updatePromisingPraticeDto);
    }
    remove(id) {
        return this.promisingPraticeService.remove(id);
    }
};
exports.PromisingPraticeController = PromisingPraticeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_promising_pratice_dto_1.CreatePromisingPraticeDto]),
    __metadata("design:returntype", void 0)
], PromisingPraticeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromisingPraticeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromisingPraticeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_promising_pratice_dto_1.UpdatePromisingPraticeDto]),
    __metadata("design:returntype", void 0)
], PromisingPraticeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromisingPraticeController.prototype, "remove", null);
exports.PromisingPraticeController = PromisingPraticeController = __decorate([
    (0, common_1.Controller)('promising-pratice'),
    __metadata("design:paramtypes", [promising_pratice_service_1.PromisingPraticeService])
], PromisingPraticeController);
//# sourceMappingURL=promising-pratice.controller.js.map