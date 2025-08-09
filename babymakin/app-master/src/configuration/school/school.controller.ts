import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  findAll() {
    return this.schoolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(id);
  }

  @Get(':id/studentcharateritices')
  getStudentCharatertices(@Param('id') id: string) {
    return this.schoolService.getStudentCharateriticsForSchool(id);
  }

  @Get(':id/promisingpractise')
  getPromisingPractise(@Param('id') id: string) {
    return this.schoolService.getPromisingPractiseForSchool(id);
  }

  @Get(':id/successsigns')
  getSuccessSigns(@Param('id') id: string) {
    return this.schoolService.getSuccessSignForSchool(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolService.remove(id);
  }
}
