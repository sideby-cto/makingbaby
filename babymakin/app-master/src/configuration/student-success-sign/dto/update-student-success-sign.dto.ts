import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentSuccessSignDto } from './create-student-success-sign.dto';

export class UpdateStudentSuccessSignDto extends PartialType(
  CreateStudentSuccessSignDto,
) {}
