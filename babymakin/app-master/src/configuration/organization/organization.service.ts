import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import {
  Organization,
  OrganizationDocument,
} from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const existingId = await this.organizationModel.exists({
      name: createOrganizationDto.name,
    });

    if (existingId) {
      throw new BadRequestException(
        'An organization with this name already exists',
      );
    }

    const createdOrganization = new this.organizationModel(
      createOrganizationDto,
    );
    return createdOrganization.save();
  }

  findAll() {
    return this.organizationModel.find({});
  }

  findOne(id: string) {
    return this.organizationModel.findById(id);
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationModel.findByIdAndUpdate(id, updateOrganizationDto);
  }

  remove(id: string) {
    return this.organizationModel.findByIdAndDelete(id);
  }
}
