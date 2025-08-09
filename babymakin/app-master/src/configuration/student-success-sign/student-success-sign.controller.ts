import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentSuccessSignService } from './student-success-sign.service';
import { CreateStudentSuccessSignDto } from './dto/create-student-success-sign.dto';
import { UpdateStudentSuccessSignDto } from './dto/update-student-success-sign.dto';

@Controller('student-success-sign')
export class StudentSuccessSignController {
  constructor(
    private readonly studentSuccessSignService: StudentSuccessSignService,
  ) {}

  @Post()
  create(@Body() createStudentSuccessSignDto: CreateStudentSuccessSignDto) {
    return this.studentSuccessSignService.create(createStudentSuccessSignDto);
  }

  @Get()
  findAll() {
    return this.studentSuccessSignService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentSuccessSignService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentSuccessSignDto: UpdateStudentSuccessSignDto,
  ) {
    return this.studentSuccessSignService.update(
      id,
      updateStudentSuccessSignDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentSuccessSignService.remove(id);
  }
}
