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
exports.StoryController = void 0;
const common_1 = require("@nestjs/common");
const story_service_1 = require("./story.service");
const create_story_dto_1 = require("./dto/create-story.dto");
const update_story_dto_1 = require("./dto/update-story.dto");
const story_files_service_1 = require("./story-files.service");
const file_upload_service_1 = require("./file-upload-service");
const multer_1 = require("multer");
const platform_express_1 = require("@nestjs/platform-express");
const react2Story_dto_1 = require("./dto/react2Story.dto");
let StoryController = class StoryController {
    constructor(storyService, storyFilesService, fileUploadService) {
        this.storyService = storyService;
        this.storyFilesService = storyFilesService;
        this.fileUploadService = fileUploadService;
    }
    async react2Story(react2StoryDto) {
        const reaction = await this.storyService.react2Story(react2StoryDto);
        return reaction;
    }
    async create(createStoryDto, files) {
        const urls = await this.storyFilesService.uploadFilesAndGetUrls(files);
        const savedFiles = await this.storyFilesService.saveFileUrlsToDatabase(urls);
        const fileIds = savedFiles.map((file) => file._id);
        const storyInput = Object.assign(Object.assign({}, createStoryDto), { files: fileIds });
        const story = await this.storyService.create(storyInput);
        return story;
    }
    findAll(request) {
        const { district, school } = request.query;
        if (!district && !school)
            return [];
        return this.storyService.findAll(school, district);
    }
    findOne(id) {
        return this.storyService.findOne(id);
    }
    getUserStories(userId) {
        return this.storyService.getUserStories(userId);
    }
    async update(id, updateStoryDto, files = []) {
        let fileIds = [];
        if (files && files.length > 0) {
            const existingStory = await this.storyService.findOne(id);
            if ((existingStory === null || existingStory === void 0 ? void 0 : existingStory.files) && (existingStory === null || existingStory === void 0 ? void 0 : existingStory.files.length) > 0) {
                const prevFileIds = existingStory.files;
                await this.storyFilesService.deleteFilesForStory(prevFileIds);
            }
            const urls = await this.storyFilesService.uploadFilesAndGetUrls(files);
            const savedFiles = await this.storyFilesService.saveFileUrlsToDatabase(urls);
            fileIds = savedFiles.map((file) => file._id);
        }
        const updatePayload = fileIds.length > 0
            ? Object.assign(Object.assign({}, updateStoryDto), { files: fileIds }) : updateStoryDto;
        const updatedStory = await this.storyService.update(id, updatePayload);
        return updatedStory;
    }
    remove(id) {
        return this.storyService.remove(id);
    }
    removeFiles(id) {
        return this.storyFilesService.remove(id);
    }
};
exports.StoryController = StoryController;
__decorate([
    (0, common_1.Post)('react'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [react2Story_dto_1.React2StoryDto]),
    __metadata("design:returntype", Promise)
], StoryController.prototype, "react2Story", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({
        storage: (0, multer_1.memoryStorage)(),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_story_dto_1.CreateStoryDto,
        Array]),
    __metadata("design:returntype", Promise)
], StoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('userStories/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StoryController.prototype, "getUserStories", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({
        storage: (0, multer_1.memoryStorage)(),
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_story_dto_1.UpdateStoryDto,
        Array]),
    __metadata("design:returntype", Promise)
], StoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StoryController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('files/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StoryController.prototype, "removeFiles", null);
exports.StoryController = StoryController = __decorate([
    (0, common_1.Controller)('story'),
    __metadata("design:paramtypes", [story_service_1.StoryService,
        story_files_service_1.StoryFilesService,
        file_upload_service_1.FileUploadService])
], StoryController);
//# sourceMappingURL=story.controller.js.map