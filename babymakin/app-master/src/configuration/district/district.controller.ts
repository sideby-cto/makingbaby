import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DistrictService } from './district.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';

@Controller('districts')
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @Post()
  create(@Body() createDistrictDto: CreateDistrictDto) {
    return this.districtService.create(createDistrictDto);
  }

  @Get(':id/schools')
  async getSchoolsForDistrict(@Param('id') districtId: string) {
    return this.districtService.getSchoolsForDistrict(districtId);
  }

  @Get()
  findAll() {
    return this.districtService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.districtService.findOne(id);
  }

  @Get(':id/studentcharateritices')
  getStudentCharatertices(@Param('id') id: string) {
    return this.districtService.getStudentCharateriticsForDistrict(id);
  }

  @Get(':id/promisingpractise')
  getPromisingPractise(@Param('id') id: string) {
    return this.districtService.getPromisingPractiseForDistrict(id);
  }

  @Get(':id/successsigns')
  getSuccessSigns(@Param('id') id: string) {
    return this.districtService.getSuccessSignForDistrict(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDistrictDto: UpdateDistrictDto,
  ) {
    return this.districtService.update(id, updateDistrictDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.districtService.remove(id);
  }
}
