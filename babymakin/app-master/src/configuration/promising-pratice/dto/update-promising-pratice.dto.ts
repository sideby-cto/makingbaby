import { PartialType } from '@nestjs/mapped-types';
import { CreatePromisingPraticeDto } from './create-promising-pratice.dto';

export class UpdatePromisingPraticeDto extends PartialType(
  CreatePromisingPraticeDto,
) {}
