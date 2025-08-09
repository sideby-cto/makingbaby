import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import decodeToken from 'jwt-decode';
import {
  School,
  SchoolDocument,
} from 'src/configuration/school/entities/school.entity';
import { SchoolService } from 'src/configuration/school/school.service';
import { TeamService } from 'src/configuration/team/team.service';
import { UserService } from 'src/user/user.service';
import { Story, StoryDocument } from 'src/story/entities/story.entity';

export interface DashboardFilter {
  district: any;
  school: any;
  team?: any;
  goal: any;
  successSign?: any;
  from?: any;
  to?: any;
  all?: any;
  userId?: any;
  storyType?: any;
  studentCharacteristics?: any;
  promisingPractices?: any;
  userToken?: any;
}

export type DecodedUserToken = {
  sub?: string,
  version?: string,
  iat?: number,
  exp?: number,
}

function getUserIdFromToken(token: string): string {
  const decodedToken = decodeToken(token) as DecodedUserToken;
  return decodedToken.sub || '';
}

@Injectable()
export class DashboardService {
  private COLORS: string[] = [
    '#678293',
    '#B9BDC8',
    '#DDCABB',
    '#DCB13C',
    '#57BDA2',
    '#2493A2',
    '#304A78',
    '#2C3259',
  ];
  constructor(
    @InjectModel(Story.name) private model: Model<StoryDocument>,
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    private schoolService: SchoolService,
    private teamService: TeamService,
    private userService: UserService,
  ) {}

  async getDashboardData(filter: DashboardFilter) {
    const stories = await this.getStories(filter);

    // Get successSigns, promisingPractices, and studentCharacteristics from stories
    const {
      successSigns,
      promisingPractices,
      studentCharacteristics,
    } = await this.getIndicatorsFromStories(stories, filter);

    return {
      stories,
      successSigns,
      promisingPractices,
      studentCharacteristics,
    };
  }

  private async getStories(filter: DashboardFilter) {
    const queryConditions = await this.getQueryConditionsFromFilters(filter);
    if (queryConditions === null) return [];
    return this.model
      .find({ $and: queryConditions })
      .sort({ createdAt: -1 })
      .populate('successSigns')
      .populate('studentCharacteristics')
      .populate('promisingPractices')
      .populate('author')
      .populate('files', 'url')
      .lean()
      .exec();
  }

  private async getQueryConditionsFromFilters(filter: DashboardFilter) {
    const conditions: any[] = [];
    let schools: mongoose.Types.ObjectId[] = [];
    const loggedInUserId = getUserIdFromToken(filter.userToken);
    const loggedInUser = await this.userService.findOne(loggedInUserId) as any;

    // Admin role should get all stories regardless of school or district assignment
    if (loggedInUser?.permissionLevel !== 'Admin' || filter.district || filter.school) {
      // School condition
      if (filter.school) {
        if (filter.school.startsWith('scid_')) {
          // School classification
          const schoolClassificationId = filter.school.substring(5);
          let schoolList = [];
          if (filter.district) {
            schoolList = await this.schoolService.getSchoolsForDistrict(filter.district);
          } else if(loggedInUser?.schools.length) {
            schoolList = loggedInUser.schools;
          }
          const schoolsInClassification = schoolList.filter((x: any) => x.schoolClassification?._id.toString() === schoolClassificationId);
          if (!schoolsInClassification.length) return null; // Bail if there aren't any schools in the selected classification
          schools = schoolsInClassification.map((x: any) => x._id);
        } else {
          // Single school
          schools.push(filter.school);
        }
      } else if (filter.district) {
        // All schools in district
        const schoolsInDistrict = await this.schoolService.getSchoolsForDistrict(filter.district);
        if (!schoolsInDistrict?.length) return null; // Bail if district has no schools
        schools = schoolsInDistrict.map((x) => x._id);
      } else {
        // All schools assigned to user
        if (!loggedInUser?.schools?.length) {
          return null; // Bail if user is not assigned to any schools
        }
        schools = loggedInUser.schools.map((x: any) => x._id);
      }
      conditions.push({ school: { $in: schools } });
    }

    // Author/userId condition
    // Note: the author property will be missing from anonymous stories
    // and the userId property does not exist on stories created prior to April 2023
    if (filter.userId) {
      // Single user
      // Ignore anonymous stories if selected user is NOT the logged-in user

      if (filter.userId !== loggedInUserId) {
        conditions.push({ author: { $ne: null } }); // Exclude stories by anonymous author
      };
      conditions.push({ $or: [{ author: filter.userId }, { userId: filter.userId }, { taggedUsersId: filter.userId }] });
    } else if (filter.team) {
      // Extract users of selected team if NO user is selected
      const userIds = await this.teamService.findUsersForTeam(filter.team);
      if (!userIds.length) return null; // Bail if team has no users
      conditions.push({ $or: [{ author: { $in: userIds } }, { userId: { $in: userIds }}, { taggedUsersId: { $in: userIds }}] });
    }

    // Goal condition (which is just all success signs assigned to goal)
    if (filter.goal) {
      const goalSuccessSigns: any[] = [];
      for (const schoolId of schools) {
        const schoolGoal = await this.getGoalDataForSchool(filter.goal, schoolId);
        if (schoolGoal) goalSuccessSigns.push(...schoolGoal.successSigns);
      }
      if (!goalSuccessSigns.length) return null; // Bail if goal has no success signs
      conditions.push({ successSigns: { $in: goalSuccessSigns } });
    }

    // Success sign condition
    if (filter.successSign) {
      conditions.push({ successSigns: filter.successSign });
    }

    // Promising practice condition
    if (filter.promisingPractices) {
      conditions.push({ promisingPractices: filter.promisingPractices });
    }

    // Student characteristic condition
    if (filter.studentCharacteristics) {
      conditions.push({ studentCharacteristics: filter.studentCharacteristics });
    }

    // Time condition
    if (filter.from && filter.to) {
      const fromDate = new Date(filter.from);
      const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
      const toDate = new Date(filter.to);
      const to = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 1);
      conditions.push({ createdAt: { $gte: from, $lte: to } });
    }

    // Story type condition
    if (filter.storyType) {
      conditions.push({ type: filter.storyType });
    }
    return conditions;
  }

  private async getGoalDataForSchool(goalId: mongoose.Types.ObjectId, schoolId: mongoose.Types.ObjectId) {
    const result = await this.schoolModel
      .findOne({ _id: schoolId })
      .select('schoolGoals')
      .lean()
      .exec();
    return result?.schoolGoals.find((x) => x.goal._id === goalId);
  }

  private getIndicatorsFromStories(stories: any[], filter: DashboardFilter) {
    let successSignAggregator = {};
    let promisingPracticeAggregator = {};
    let studentCharacteristicAggregator = {};
    // Loop through stories and tally indicator counts. Note: if filtering by an
    // indicator, only the filtered one will be counted for that indicator type.
    stories.forEach((story: any) => {
      story.successSigns.forEach((successSign: any) => {
        this.addToIndicatorAggregator(
          successSign,
          successSignAggregator,
          filter.successSign,
        );
      });
      story.promisingPractices.forEach((promisingPractice: any) => {
        this.addToIndicatorAggregator(
          promisingPractice,
          promisingPracticeAggregator,
          filter.promisingPractices,
        );
      });
      story.studentCharacteristics.forEach((studentCharacteristic: any) => {
        this.addToIndicatorAggregator(
          studentCharacteristic,
          studentCharacteristicAggregator,
          filter.studentCharacteristics,
        );
      });
    });

    // Sort indicators alphabetically
    const successSigns = this.sortResults(
      Object.values(successSignAggregator),
      'name',
    );
    const promisingPractices = this.sortResults(
      Object.values(promisingPracticeAggregator),
      'name'
    );
    const studentCharacteristics = this.sortResults(
      Object.values(studentCharacteristicAggregator),
      'name'
    );

    // Add color code to each indicator
    const chooser = this.getColor(this.COLORS);
    successSigns.forEach((obj) => { obj.color = chooser(); });
    promisingPractices.forEach((obj) => { obj.color = chooser(); });
    studentCharacteristics.forEach((obj) => { obj.color = chooser(); });

    return {
      successSigns,
      promisingPractices,
      studentCharacteristics,
    };
  }

  private addToIndicatorAggregator(
    indicator: any,
    aggregatorObject: any,
    filterId?: string
  ) {
    if (filterId && !indicator._id.equals(filterId)) return;
    if (!aggregatorObject[indicator._id]) {
      aggregatorObject[indicator._id] = {
        value: 1,
        name: indicator.name,
        id: indicator._id,
      }
    } else {
      aggregatorObject[indicator._id].value++;
    }
  }

  private getColor(array: string[]) {
    let index = 0;

    return function () {
      if (index >= array.length) {
        index = 0;
      }

      const color = array[index];
      index++;

      return color;
    };
  }

  private sortResults(array: any[], property: string) {
    const sortedResult = array.sort((a, b) => {
      const valueA = a[property].toLowerCase();
      const valueB = b[property].toLowerCase();

      let i = 0;
      while (valueA[i] === valueB[i]) {
        i++;
      }
      return valueA[i].localeCompare(valueB[i]);
    });

    return sortedResult;
  }
}
