import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStudentCharacticeDto } from './dto/create-student-charactice.dto';
import { UpdateStudentCharacticeDto } from './dto/update-student-charactice.dto';
import {
  StudentCharactice,
  StudentCharacticeDocument,
} from './entities/student-charactice.entity';

@Injectable()
export class StudentCharacticeService {
  constructor(
    @InjectModel(StudentCharactice.name)
    private studentCharaModel: Model<StudentCharacticeDocument>,
  ) {}

  create(createStudentCharacticeDto: CreateStudentCharacticeDto) {
    const createdModel = new this.studentCharaModel(createStudentCharacticeDto);
    return createdModel.save();
  }

  findAll() {
    return this.studentCharaModel.find({});
  }

  findOne(id: string) {
    return this.studentCharaModel.findById(id);
  }

  update(id: string, updateStudentCharacticeDto: UpdateStudentCharacticeDto) {
    return this.studentCharaModel.findByIdAndUpdate(
      id,
      updateStudentCharacticeDto,
    );
  }

  remove(id: string) {
    return this.studentCharaModel.findByIdAndRemove(id);
  }
}
