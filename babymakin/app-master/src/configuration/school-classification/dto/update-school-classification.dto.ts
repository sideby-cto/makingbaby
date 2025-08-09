import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolClassificationDto } from './create-school-classification.dto';

export class UpdateSchoolClassificationDto extends PartialType(CreateSchoolClassificationDto) {}
