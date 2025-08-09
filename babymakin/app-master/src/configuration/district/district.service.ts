import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PromisingPractise,
  PromisingPractiseDocument,
} from '../promising-pratice/entities/promising-pratice.entity';
import { SchoolService } from '../school/school.service';
import {
  StudentCharactice,
  StudentCharacticeDocument,
} from '../student-charactice/entities/student-charactice.entity';
import {
  StudentSuccessSign,
  StudentSuccessSignDocument,
} from '../student-success-sign/entities/student-success-sign.entity';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { District, DistrictDocument } from './entities/district.entity';

@Injectable()
export class DistrictService {
  constructor(
    @InjectModel(District.name) private districtModel: Model<DistrictDocument>,
    private schoolService: SchoolService,
    @InjectModel(StudentCharactice.name)
    private studentCharacticeModel: Model<StudentCharacticeDocument>,
    @InjectModel(PromisingPractise.name)
    private promisingPracticeModel: Model<PromisingPractiseDocument>,
    @InjectModel(StudentSuccessSign.name)
    private successSigneModel: Model<StudentSuccessSignDocument>,
  ) {}
  async create(createDistrictDto: CreateDistrictDto) {
    const existingId = await this.districtModel.exists({
      name: createDistrictDto.name,
    });

    if (existingId) {
      throw new BadRequestException('A district with this name already exists');
    }

    if (createDistrictDto.organization === '') createDistrictDto.organization = null;
    const createdDistrict = new this.districtModel(createDistrictDto);
    return createdDistrict.save();
  }

  findAll() {
    return this.districtModel
      .find({})
      .populate('organization')
      .populate('districtGoals.goal')
      .populate('districtGoals.promisingPractices')
      .populate('districtGoals.successSigns')
      .populate('districtGoals.studentCharacteristics');
  }

  findOne(id: string) {
    return this.districtModel
      .findById(id)
      .populate('organization')
      .populate('districtGoals.goal')
      .populate('districtGoals.promisingPractices')
      .populate('districtGoals.successSigns')
      .populate('districtGoals.studentCharacteristics');
  }

  update(id: string, updateDistrictDto: UpdateDistrictDto) {
    if (updateDistrictDto.organization === '') updateDistrictDto.organization = null;
    return this.districtModel.findByIdAndUpdate(id, updateDistrictDto);
  }

  remove(id: string) {
    return this.districtModel.findByIdAndRemove(id);
  }

  getSchoolsForDistrict(districtId: string) {
    return this.schoolService.getSchoolsForDistrict(districtId);
  }

  getDistrictsForOrganization(organizationId: string) {
    return this.districtModel
      .find({ organization: organizationId.toString() });
  }

  async getStudentCharateriticsForDistrict(districtId: string) {
    const distinctIds = await this.districtModel
      .distinct('districtGoals.studentCharacteristics', { _id: districtId })
      .exec();

    return this.studentCharacticeModel.find({ _id: { $in: distinctIds } });
  }

  async getPromisingPractiseForDistrict(districtId: string) {
    const distinctIds = await this.districtModel
      .distinct('districtGoals.promisingPractices', { _id: districtId })
      .exec();

    return this.promisingPracticeModel.find({ _id: { $in: distinctIds } });
  }

  async getSuccessSignForDistrict(districtId: string) {
    const distinctIds = await this.districtModel
      .distinct('districtGoals.successSigns', { _id: districtId })
      .exec();

    return this.successSigneModel.find({ _id: { $in: distinctIds } });
  }
}
