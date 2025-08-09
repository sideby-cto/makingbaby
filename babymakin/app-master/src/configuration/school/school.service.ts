import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PromisingPractise,
  PromisingPractiseDocument,
} from '../promising-pratice/entities/promising-pratice.entity';
import {
  StudentCharactice,
  StudentCharacticeDocument,
} from '../student-charactice/entities/student-charactice.entity';
import {
  StudentSuccessSign,
  StudentSuccessSignDocument,
} from '../student-success-sign/entities/student-success-sign.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School, SchoolDocument } from './entities/school.entity';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    @InjectModel(StudentCharactice.name)
    private studentCharacticeModel: Model<StudentCharacticeDocument>,
    @InjectModel(PromisingPractise.name)
    private promisingPracticeModel: Model<PromisingPractiseDocument>,
    @InjectModel(StudentSuccessSign.name)
    private successSigneModel: Model<StudentSuccessSignDocument>,
  ) {}
  async create(createSchoolDto: CreateSchoolDto) {
    const existingSchoolForDistrict = await this.schoolModel
      .exists({
        $and: [
          { name: createSchoolDto.name },
          { district: createSchoolDto.district },
        ],
      })
      .exec();
    if (existingSchoolForDistrict) {
      throw new BadRequestException(
        'A school with this name already exists for this district',
      );
    }

    if (createSchoolDto.schoolClassification === '') createSchoolDto.schoolClassification = null;
    const createdSchool = new this.schoolModel(createSchoolDto);
    return createdSchool.save();
  }

  findAll() {
    return this.schoolModel
      .find({})
      .populate('schoolClassification')
      .populate('district')
      .populate('schoolGoals.goal')
      .populate('schoolGoals.promisingPractices')
      .populate('schoolGoals.successSigns')
      .populate('schoolGoals.studentCharacteristics');
  }

  findOne(id: string) {
    return this.schoolModel
      .findById(id)
      .populate('schoolClassification')
      .populate('district')
      .populate('schoolGoals.goal')
      .populate('schoolGoals.promisingPractices')
      .populate('schoolGoals.successSigns')
      .populate('schoolGoals.studentCharacteristics');
  }

  update(id: string, updateSchoolDto: UpdateSchoolDto) {
    if (updateSchoolDto.schoolClassification === '') updateSchoolDto.schoolClassification = null;
    return this.schoolModel.findByIdAndUpdate(id, updateSchoolDto);
  }

  remove(id: string) {
    return this.schoolModel.findByIdAndRemove(id);
  }

  getSchoolsForDistrict(districtId: string) {
    return this.schoolModel
      .find({ district: districtId.toString() })
      .populate('schoolClassification')
      .populate('district')
      .populate('schoolGoals.goal')
      .populate('schoolGoals.promisingPractices')
      .populate('schoolGoals.successSigns')
      .populate('schoolGoals.studentCharacteristics');
  }

  async getStudentCharateriticsForSchool(schoolId: string) {
    const distinctIds = await this.schoolModel
      .distinct('schoolGoals.studentCharacteristics', { _id: schoolId })
      .exec();

    return this.studentCharacticeModel.find({ _id: { $in: distinctIds } });
  }

  async getPromisingPractiseForSchool(schoolId: string) {
    const distinctIds = await this.schoolModel
      .distinct('schoolGoals.promisingPractices', { _id: schoolId })
      .exec();

    return this.promisingPracticeModel.find({ _id: { $in: distinctIds } });
  }

  async getSuccessSignForSchool(schoolId: string) {
    const distinctIds = await this.schoolModel
      .distinct('schoolGoals.successSigns', { _id: schoolId })
      .exec();

    return this.successSigneModel.find({ _id: { $in: distinctIds } });
  }
}
