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
exports.StoryFilesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const path_1 = require("path");
const story_file_entity_1 = require("./entities/story-file.entity");
const file_upload_service_1 = require("./file-upload-service");
let StoryFilesService = class StoryFilesService {
    constructor(model, fileUploadService) {
        this.model = model;
        this.fileUploadService = fileUploadService;
    }
    uploadFilesAndGetUrls(files) {
        return Promise.all(files.map(async (file) => {
            const s3Key = `${Date.now()}_${file.originalname}`;
            await this.fileUploadService.uploadFile(file, s3Key);
            return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
        }));
    }
    create(createStoryFileDto) {
        const entity = new this.model(createStoryFileDto);
        return entity.save();
    }
    saveFileUrlsToDatabase(fileUrls) {
        return Promise.all(fileUrls.map(async (url) => {
            const file = { url };
            const createdFile = await this.create(file);
            return createdFile;
        }));
    }
    findAll() {
        return `This action returns all storyFiles`;
    }
    findOne(id) {
        return `This action returns a #${id} storyFile`;
    }
    async remove(id) {
        await this.deleteFilesForStory([id]);
    }
    async deleteFilesForStory(fileIds) {
        const files = await this.model.where('_id').in(fileIds).lean().exec();
        files
            .map((file) => (0, path_1.join)(process.cwd(), 'uploads', (0, path_1.basename)(file.url)))
            .forEach((url) => {
            const s3Key = url.split('/').pop();
            if (s3Key)
                this.fileUploadService.deleteFile(s3Key);
        });
        fileIds.forEach(async (id) => await this.model.findByIdAndDelete(id));
    }
};
exports.StoryFilesService = StoryFilesService;
exports.StoryFilesService = StoryFilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(story_file_entity_1.StoryFile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        file_upload_service_1.FileUploadService])
], StoryFilesService);
//# sourceMappingURL=story-files.service.js.map