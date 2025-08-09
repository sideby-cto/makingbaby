import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePromisingPraticeDto } from './dto/create-promising-pratice.dto';
import { UpdatePromisingPraticeDto } from './dto/update-promising-pratice.dto';
import {
  PromisingPractise,
  PromisingPractiseDocument,
} from './entities/promising-pratice.entity';

@Injectable()
export class PromisingPraticeService {
  constructor(
    @InjectModel(PromisingPractise.name)
    private promisingModel: Model<PromisingPractiseDocument>,
  ) {}
  create(createPromisingPraticeDto: CreatePromisingPraticeDto) {
    const model = new this.promisingModel(createPromisingPraticeDto);
    return model.save();
  }

  findAll() {
    return this.promisingModel.find({});
  }

  findOne(id: string) {
    return this.promisingModel.findById(id);
  }

  update(id: string, updatePromisingPraticeDto: UpdatePromisingPraticeDto) {
    return this.promisingModel.findByIdAndUpdate(id, updatePromisingPraticeDto);
  }

  remove(id: string) {
    return this.promisingModel.findByIdAndRemove(id);
  }
}
