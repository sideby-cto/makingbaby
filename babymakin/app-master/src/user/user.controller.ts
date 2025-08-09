import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from 'src/core/events/userCreatedEvent';
import { PaginationInput } from 'src/share/types/pagination-input';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const eventPayload: UserCreatedEvent = { email: user.email };
    await this.eventEmitter.emitAsync('user.created', eventPayload);
    return user;
  }

  @Get()
  findAll(
    @Query('currentPage') currentPage: number,
    @Query('pageSize') pageSize: number,
    @Query('filter') filter: string,
  ) {
    return this.userService.findAll(
      new PaginationInput(currentPage, pageSize, filter),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User Not Found');
    return user;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
