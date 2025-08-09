import { Test, TestingModule } from '@nestjs/testing';
import { SchoolClassificationController } from './school-classification.controller';
import { SchoolClassificationService } from './school-classification.service';

describe('SchoolClassificationController', () => {
  let controller: SchoolClassificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolClassificationController],
      providers: [SchoolClassificationService],
    }).compile();

    controller = module.get<SchoolClassificationController>(SchoolClassificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
