import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSchoolClassificationDto } from './dto/create-school-classification.dto';
import { UpdateSchoolClassificationDto } from './dto/update-school-classification.dto';
import { SchoolClassification, SchoolClassificationDocument } from './entities/school-classification.entity';

@Injectable()
export class SchoolClassificationService {
  constructor(
    @InjectModel(SchoolClassification.name) private schoolClassificationModel: Model<SchoolClassificationDocument>,
  ) {}

  async create(createSchoolClassificationDto: CreateSchoolClassificationDto) {
    const existingId = await this.schoolClassificationModel.exists({
      name: createSchoolClassificationDto.name,
    });

    if (existingId) {
      throw new BadRequestException('A school classification with this name already exists');
    }

    const createdSchoolClassification = new this.schoolClassificationModel(createSchoolClassificationDto);
    return createdSchoolClassification.save();
  }

  findAll() {
    return this.schoolClassificationModel.find({})
  }

  findOne(id: string) {
    return this.schoolClassificationModel.findById(id)
  }

  update(id: string, updateSchoolClassificationDto: UpdateSchoolClassificationDto) {
    return this.schoolClassificationModel.findByIdAndUpdate(id, updateSchoolClassificationDto);
  }

  remove(id: string) {
    return this.schoolClassificationModel.findByIdAndDelete(id);
  }
}
