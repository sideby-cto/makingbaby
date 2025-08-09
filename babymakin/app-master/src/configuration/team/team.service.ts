import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/entities/user.entity';
import {
  District,
  DistrictDocument,
  DistrictGoal,
} from '../district/entities/district.entity';
import { School, SchoolDocument } from '../school/entities/school.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team, TeamDocument } from './entities/team.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(District.name) private districtModel: Model<DistrictDocument>,
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    const existingTeamForSchool = await this.teamModel
      .exists({
        $and: [{ name: createTeamDto.name }, { school: createTeamDto.school }],
      })
      .exec();
    if (existingTeamForSchool) {
      throw new BadRequestException(
        'A team with this name already exists for this school',
      );
    }
    const createdTeam = new this.teamModel(createTeamDto);
    return createdTeam.save();
  }

  findAll() {
    return this.teamModel
      .find({})
      .populate('school')
      .populate('teamGoals.goal')
      .populate('teamGoals.promisingPractices')
      .populate('teamGoals.successSigns')
      .populate('teamGoals.studentCharacteristics');
  }

  findOne(id: string) {
    return this.teamModel
      .findById(id)
      .populate('school')
      .populate('teamGoals.goal')
      .populate('teamGoals.promisingPractices')
      .populate('teamGoals.successSigns')
      .populate('teamGoals.studentCharacteristics');
  }

  update(id: string, updateTeamDto: UpdateTeamDto) {
    return this.teamModel.findByIdAndUpdate(id, updateTeamDto);
  }

  remove(id: string) {
    return this.teamModel.findByIdAndRemove(id);
  }

  public async getGoalDataForTeam(goal: any, teamId: any) {
    const team = await this.teamModel
      .findById(teamId)
      .select('school')
      .lean()
      .exec();

    const schoolId = team?.school;

    const schoolGoals = await this.schoolModel
      .findById(schoolId)
      .select('schoolGoals')
      .lean()
      .exec();

    const output = schoolGoals?.schoolGoals.find((x) => x.goal._id === goal);

    return { teamGoal: output, schoolId };
  }

  async findUsersForTeam(teamId: string) {
    const teamUsers = await this.userModel
      .find({ teams: teamId })
      .select(['_id'])
      .exec();

    const ids = teamUsers.map((x) => x._id.toString());
    return ids;
  }
}
