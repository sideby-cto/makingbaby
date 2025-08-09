import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SchoolService } from '../configuration/school/school.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { React2StoryDto } from './dto/react2Story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryReaction, StoryDocument as StoryReactionDoc } from './entities/story-reaction.entity';
import { Story, StoryDocument as StoryDoc } from './entities/story.entity';
import { StoryFilesService } from './story-files.service';
@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private model: Model<StoryDoc>,
    @InjectModel(StoryReaction.name)
    private storyReactionModel: Model<StoryReactionDoc>,
    private readonly schoolService: SchoolService,
    private readonly storyFileService: StoryFilesService,
  ) {}

  async react2Story(react2StoryDto: React2StoryDto) {
    const model = new this.storyReactionModel(react2StoryDto);
    const reaction = await model.save();
    const reactionUpdate = { $inc: this.getReactionsType(react2StoryDto) };
    await this.update(react2StoryDto.story, reactionUpdate);
    return reaction;
  }

  private getReactionsType(react2StoryDto: React2StoryDto) {
    if (react2StoryDto.type == 'High5') return { high5s: 1 };
    else if (react2StoryDto.type == 'Like') return { likes: 1 };
    return { Insighfuls: 1 };
  }

  async create(createStoryDto: CreateStoryDto) {
    const model = new this.model(createStoryDto);
    const story = await model.save();
    return story;
  }

  findAll(school: any, district: any) {
    const $or: any[] = [];
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

  findOne(id: string) {
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

  update(id: string, updateStoryDto: UpdateStoryDto) {
    return this.model.findByIdAndUpdate(id, updateStoryDto, { new: true })
      .populate('files')
      .lean();
  }

  async addFilesToStory(storyId: string, files: string[]) {
    this.model.findByIdAndUpdate(storyId, {
      $push: { files: { $each: files } },
    });
  }

  async remove(id: string) {
    const story = await this.model.findById(id).lean().exec();
    if (story) {
      const storyFileIds = story.files;
      await this.storyFileService.deleteFilesForStory(storyFileIds);
      return this.model.findByIdAndRemove(id);
    }
  }

  async getUserStories(userId: string) {
    const userStories = await this.model
      .find({ userId: userId })
      .populate('files')
      .lean()
      .exec();
    return userStories;
  }
}
