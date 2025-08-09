"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryModule = void 0;
const common_1 = require("@nestjs/common");
const story_service_1 = require("./story.service");
const story_controller_1 = require("./story.controller");
const mongoose_1 = require("@nestjs/mongoose");
const story_entity_1 = require("./entities/story.entity");
const platform_express_1 = require("@nestjs/platform-express");
const story_file_entity_1 = require("./entities/story-file.entity");
const story_files_service_1 = require("./story-files.service");
const file_upload_service_1 = require("./file-upload-service");
const story_reaction_entity_1 = require("./entities/story-reaction.entity");
const school_service_1 = require("../configuration/school/school.service");
const school_entity_1 = require("../configuration/school/entities/school.entity");
const promising_pratice_entity_1 = require("../configuration/promising-pratice/entities/promising-pratice.entity");
const student_charactice_entity_1 = require("../configuration/student-charactice/entities/student-charactice.entity");
const student_success_sign_entity_1 = require("../configuration/student-success-sign/entities/student-success-sign.entity");
let StoryModule = class StoryModule {
};
exports.StoryModule = StoryModule;
exports.StoryModule = StoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: story_reaction_entity_1.StoryReaction.name, schema: story_reaction_entity_1.StoryReactionSchema },
                { name: story_entity_1.Story.name, schema: story_entity_1.StorySchema },
                { name: story_file_entity_1.StoryFile.name, schema: story_file_entity_1.StoryFilesSchema },
                { name: school_entity_1.School.name, schema: school_entity_1.SchoolSchema },
                { name: student_charactice_entity_1.StudentCharactice.name, schema: student_charactice_entity_1.StudentCharacticeSchema },
                { name: promising_pratice_entity_1.PromisingPractise.name, schema: promising_pratice_entity_1.PromisingPractiseSchema },
                { name: student_success_sign_entity_1.StudentSuccessSign.name, schema: student_success_sign_entity_1.StudentSuccessSignSchema },
            ]),
            platform_express_1.MulterModule.register({
                dest: 'uploads/',
            }),
        ],
        controllers: [story_controller_1.StoryController],
        providers: [story_service_1.StoryService, story_files_service_1.StoryFilesService, school_service_1.SchoolService, file_upload_service_1.FileUploadService],
    })
], StoryModule);
//# sourceMappingURL=story.module.js.map