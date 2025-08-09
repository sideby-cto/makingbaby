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
exports.StoryReactionSchema = exports.StoryReaction = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("../../user/entities/user.entity");
const story_entity_1 = require("./story.entity");
let StoryReaction = class StoryReaction {
};
exports.StoryReaction = StoryReaction;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], StoryReaction.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: user_entity_1.User.name,
    }),
    __metadata("design:type", String)
], StoryReaction.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: story_entity_1.Story.name,
    }),
    __metadata("design:type", String)
], StoryReaction.prototype, "story", void 0);
exports.StoryReaction = StoryReaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], StoryReaction);
exports.StoryReactionSchema = mongoose_1.SchemaFactory.createForClass(StoryReaction);
//# sourceMappingURL=story-reaction.entity.js.map