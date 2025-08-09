import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/getstarted')
  findAll(@Req() request: Request) {
    const {
      district,
      school,
      goal,
      from,
      to,
      team,
      all,
      userId,
      storyType,
      studentCharacteristics,
      promisingPractices,
      successSign
    } = request.query;
    const userToken = request.headers.usertoken;
    return this.dashboardService.getDashboardData({
      district,
      school,
      goal,
      from,
      to,
      team,
      all,
      userId,
      storyType,
      studentCharacteristics,
      promisingPractices,
      successSign,
      userToken
    });
  }
}
