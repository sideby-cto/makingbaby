import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchoolClassificationService } from './school-classification.service';
import { CreateSchoolClassificationDto } from './dto/create-school-classification.dto';
import { UpdateSchoolClassificationDto } from './dto/update-school-classification.dto';
  
@Controller('school-classifications')
export class SchoolClassificationController {
  constructor(private readonly schoolClassificationService: SchoolClassificationService) {}

  @Post()
  create(@Body() createSchoolClassificationDto: CreateSchoolClassificationDto) {
    return this.schoolClassificationService.create(createSchoolClassificationDto);
  }

  @Get()
  findAll() {
    return this.schoolClassificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolClassificationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSchoolClassificationDto: UpdateSchoolClassificationDto,
  ) {
    return this.schoolClassificationService.update(id, updateSchoolClassificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolClassificationService.remove(id);
  }
}
