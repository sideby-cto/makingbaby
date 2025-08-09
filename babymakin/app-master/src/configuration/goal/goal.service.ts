import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Goal, GoalDocument } from './entities/goal.entity';

@Injectable()
export class GoalService {
  constructor(@InjectModel(Goal.name) private goalModel: Model<GoalDocument>) {}
  create(createGoalDto: CreateGoalDto) {
    const createdGoal = new this.goalModel(createGoalDto);
    return createdGoal.save();
  }

  findAll() {
    return this.goalModel.find({});
  }

  findOne(id: string) {
    return this.goalModel.findById(id);
  }

  update(id: string, updateGoalDto: UpdateGoalDto) {
    return this.goalModel.findByIdAndUpdate(id, updateGoalDto);
  }

  remove(id: string) {
    return this.goalModel.findByIdAndRemove(id);
  }
}
