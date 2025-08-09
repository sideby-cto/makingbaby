import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentCharacticeService } from './student-charactice.service';
import { CreateStudentCharacticeDto } from './dto/create-student-charactice.dto';
import { UpdateStudentCharacticeDto } from './dto/update-student-charactice.dto';

@Controller('student-characteristics')
export class StudentCharacticeController {
  constructor(
    private readonly studentCharacticeService: StudentCharacticeService,
  ) {}

  @Post()
  create(@Body() createStudentCharacticeDto: CreateStudentCharacticeDto) {
    return this.studentCharacticeService.create(createStudentCharacticeDto);
  }

  @Get()
  findAll() {
    return this.studentCharacticeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentCharacticeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentCharacticeDto: UpdateStudentCharacticeDto,
  ) {
    return this.studentCharacticeService.update(id, updateStudentCharacticeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentCharacticeService.remove(id);
  }
}
