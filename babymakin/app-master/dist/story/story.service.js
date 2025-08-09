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
exports.StoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const school_service_1 = require("../configuration/school/school.service");
const story_reaction_entity_1 = require("./entities/story-reaction.entity");
const story_entity_1 = require("./entities/story.entity");
const story_files_service_1 = require("./story-files.service");
let StoryService = class StoryService {
    constructor(model, storyReactionModel, schoolService, storyFileService) {
        this.model = model;
        this.storyReactionModel = storyReactionModel;
        this.schoolService = schoolService;
        this.storyFileService = storyFileService;
    }
    async react2Story(react2StoryDto) {
        const model = new this.storyReactionModel(react2StoryDto);
        const reaction = await model.save();
        const reactionUpdate = { $inc: this.getReactionsType(react2StoryDto) };
        await this.update(react2StoryDto.story, reactionUpdate);
        return reaction;
    }
    getReactionsType(react2StoryDto) {
        if (react2StoryDto.type == 'High5')
            return { high5s: 1 };
        else if (react2StoryDto.type == 'Like')
            return { likes: 1 };
        return { Insighfuls: 1 };
    }
    async create(createStoryDto) {
        const model = new this.model(createStoryDto);
        const story = await model.save();
        return story;
    }
    findAll(school, district) {
        const $or = [];
        if (school) {
            $or.push({ school: school });
        }
        if (district) {
            $or.push({ district: district });
        }
        return this.model
            .find({ $or: $or })
            .populate('successSigns')
            .populate('studentCharacteristics')
            .populate('promisingPractices')
            .populate('author')
            .populate('files', 'url')
            .exec();
    }
    findOne(id) {
        return this.model
            .findById(id)
            .populate('successSigns')
            .populate('studentCharacteristics')
            .populate('promisingPractices')
            .populate('author')
            .populate('files')
            .lean()
            .exec();
    }
    update(id, updateStoryDto) {
        return this.model.findByIdAndUpdate(id, updateStoryDto, { new: true })
            .populate('files')
            .lean();
    }
    async addFilesToStory(storyId, files) {
        this.model.findByIdAndUpdate(storyId, {
            $push: { files: { $each: files } },
        });
    }
    async remove(id) {
        const story = await this.model.findById(id).lean().exec();
        if (story) {
            const storyFileIds = story.files;
            await this.storyFileService.deleteFilesForStory(storyFileIds);
            return this.model.findByIdAndRemove(id);
        }
    }
    async getUserStories(userId) {
        const userStories = await this.model
            .find({ userId: userId })
            .populate('files')
            .lean()
            .exec();
        return userStories;
    }
};
exports.StoryService = StoryService;
exports.StoryService = StoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(story_entity_1.Story.name)),
    __param(1, (0, mongoose_1.InjectModel)(story_reaction_entity_1.StoryReaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        school_service_1.SchoolService,
        story_files_service_1.StoryFilesService])
], StoryService);
//# sourceMappingURL=story.service.js.map