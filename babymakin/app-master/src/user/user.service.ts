import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { PaginationInput } from 'src/share/types/pagination-input';
import { DistrictService } from '../configuration/district/district.service';
import { SchoolService } from '../configuration/school/school.service';

export type UserOutput = {
  name: string;
  email: string;
  schools: string;
  permissionLevel: string;
  teams: string;
  id: string;
  district: string;
  organization: string;
  inactive?: boolean;
};

function getUserOutput(output: any): UserOutput {
  output = output ? output : {};
  return {
    name: output.name,
    email: output.email,
    schools: output.schools,
    permissionLevel: output.permissionLevel,
    teams: output.teams,
    id: output._id,
    district: output.district,
    organization: output.organization,
    inactive: output.inactive,
  };
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private districtService: DistrictService,
    private schoolService: SchoolService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserOutput> {
    const existingId = await this.userModel.exists({
      email: createUserDto.email,
    });

    if (existingId) {
      throw new BadRequestException(
        'A user with this email address already exists',
      );
    }

    const createdUser = new this.userModel(createUserDto);
    const user = await createdUser.save();
    const output = getUserOutput(user);

    return new Promise((resolve, reject) => {
      return resolve(output);
    });
  }

  async findAll(input: PaginationInput) {
    let query = {};
    if (input.filter) {
      query = {
        $or: [
          { name: { $regex: input.filter, $options: 'i' } },
          { email: { $regex: input.filter, $options: 'i' } },
          { permissionLevel: { $regex: input.filter, $options: 'i' } },
          { 'organization.name': { $regex: input.filter, $options: 'i' } },
          { 'district.name': { $regex: input.filter, $options: 'i' } },
          { 'schools.name': { $regex: input.filter, $options: 'i' } },
        ],
      };
    }

    const users = await this.userModel
      .find(query)
      .sort({ _id: 1 })
      .skip(input.currentPage * input.pageSize)
      .limit(input.pageSize)
      .populate({
        path: 'schools',
        populate: [
          {
            path: 'schoolGoals',
            model: 'DistrictGoal',
            populate: [
              {
                path: 'promisingPractices',
                model: 'PromisingPractise',
              },
              {
                path: 'successSigns',
                model: 'StudentSuccessSign',
              },
              {
                path: 'studentCharacteristics',
                model: 'StudentCharactice',
              },
            ],
          },
          {
            path: 'schoolClassification',
            model: 'SchoolClassification',
          },
        ],
      })
      .populate({
        path: 'district',
        populate: {
          path: 'districtGoals',
          model: 'DistrictGoal',
          populate: [
            {
              path: 'promisingPractices',
              model: 'PromisingPractise',
            },
            {
              path: 'successSigns',
              model: 'StudentSuccessSign',
            },
            {
              path: 'studentCharacteristics',
              model: 'StudentCharactice',
            },
            {
              path: 'goal',
              model: 'Goal',
            },
          ],
        },
      })
      .populate('mainTeam')
      .populate('teams')
      .populate('organization');
    return users.map((x) => getUserOutput(x));
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findById(id)
      .populate({
        path: 'district',
        populate: {
          path: 'districtGoals',
          model: 'DistrictGoal',
          populate: [
            {
              path: 'promisingPractices',
              model: 'PromisingPractise',
            },
            {
              path: 'successSigns',
              model: 'StudentSuccessSign',
            },
            {
              path: 'studentCharacteristics',
              model: 'StudentCharactice',
            },
            {
              path: 'goal',
              model: 'Goal',
            },
          ],
        },
      })
      .populate({
        path: 'schools',
        populate: [
          {
            path: 'schoolGoals',
            model: 'DistrictGoal',
            populate: [
              {
                path: 'promisingPractices',
                model: 'PromisingPractise',
              },
              {
                path: 'successSigns',
                model: 'StudentSuccessSign',
              },
              {
                path: 'studentCharacteristics',
                model: 'StudentCharactice',
              },
            ],
          },
          {
            path: 'schoolClassification',
            model: 'SchoolClassification',
          },
        ],
      })
      .populate('mainTeam')
      .populate('teams')
      .populate('organization');

    if (!user) return null;

    // Get all districts for the user's organization
    let organizationDistricts: any[] = [];
    let orgId: any = undefined;
    if (user.organization) {
      // If populated, _id is present; if not, it's the ObjectId itself
      orgId = (user.organization as any)._id ? (user.organization as any)._id : user.organization;
    }
    if (orgId) {
      organizationDistricts = await this.districtService.getDistrictsForOrganization(orgId);
    }

    // Get all schools for the user's districts
    if (organizationDistricts.length) {
      for (const district of organizationDistricts) {
        const schools = await this.schoolService.getSchoolsForDistrict(district._id);
        user.schools.push(...schools);
      }
    }

    return getUserOutput(user);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async findUserByEmail(email: string): Promise<User | undefined | null> {
    const user = await this.userModel
      .findOne({ email })
      .populate({
        path: 'schools',
        populate: [
          {
            path: 'schoolGoals',
            model: 'DistrictGoal',
            populate: [
              {
                path: 'promisingPractices',
                model: 'PromisingPractise',
              },
              {
                path: 'successSigns',
                model: 'StudentSuccessSign',
              },
              {
                path: 'studentCharacteristics',
                model: 'StudentCharactice',
              },
            ],
          },
          {
            path: 'schoolClassification',
            model: 'SchoolClassification',
          },
        ],
      })
      .populate({
        path: 'district',
        populate: {
          path: 'districtGoals',
          model: 'DistrictGoal',
          populate: [
            {
              path: 'promisingPractices',
              model: 'PromisingPractise',
            },
            {
              path: 'successSigns',
              model: 'StudentSuccessSign',
            },
            {
              path: 'studentCharacteristics',
              model: 'StudentCharactice',
            },
          ],
        },
      })
      .populate('mainTeam')
      .populate('teams');

    return user;
  }
}
