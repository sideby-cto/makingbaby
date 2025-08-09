import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PromisingPraticeService } from './promising-pratice.service';
import { CreatePromisingPraticeDto } from './dto/create-promising-pratice.dto';
import { UpdatePromisingPraticeDto } from './dto/update-promising-pratice.dto';

@Controller('promising-pratice')
export class PromisingPraticeController {
  constructor(
    private readonly promisingPraticeService: PromisingPraticeService,
  ) {}

  @Post()
  create(@Body() createPromisingPraticeDto: CreatePromisingPraticeDto) {
    return this.promisingPraticeService.create(createPromisingPraticeDto);
  }

  @Get()
  findAll() {
    return this.promisingPraticeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promisingPraticeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePromisingPraticeDto: UpdatePromisingPraticeDto,
  ) {
    return this.promisingPraticeService.update(id, updatePromisingPraticeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promisingPraticeService.remove(id);
  }
}
