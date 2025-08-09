import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStudentSuccessSignDto } from './dto/create-student-success-sign.dto';
import { UpdateStudentSuccessSignDto } from './dto/update-student-success-sign.dto';
import {
  StudentSuccessSign,
  StudentSuccessSignDocument,
} from './entities/student-success-sign.entity';

@Injectable()
export class StudentSuccessSignService {
  constructor(
    @InjectModel(StudentSuccessSign.name)
    private model: Model<StudentSuccessSignDocument>,
  ) {}

  create(createStudentSuccessSignDto: CreateStudentSuccessSignDto) {
    const model = new this.model(createStudentSuccessSignDto);
    return model.save();
  }

  findAll() {
    return this.model.find({});
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  update(id: string, updateStudentSuccessSignDto: UpdateStudentSuccessSignDto) {
    return this.model.findByIdAndUpdate(id, updateStudentSuccessSignDto);
  }

  remove(id: string) {
    return this.model.findByIdAndRemove(id);
  }
}
