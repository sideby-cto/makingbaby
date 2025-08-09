import { Test, TestingModule } from '@nestjs/testing';
import { StudentCharacticeController } from './student-charactice.controller';
import { StudentCharacticeService } from './student-charactice.service';

describe('StudentCharacticeController', () => {
  let controller: StudentCharacticeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentCharacticeController],
      providers: [StudentCharacticeService],
    }).compile();

    controller = module.get<StudentCharacticeController>(
      StudentCharacticeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
