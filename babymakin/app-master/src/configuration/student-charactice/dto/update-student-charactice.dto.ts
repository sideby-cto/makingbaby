import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentCharacticeDto } from './create-student-charactice.dto';

export class UpdateStudentCharacticeDto extends PartialType(
  CreateStudentCharacticeDto,
) {}
