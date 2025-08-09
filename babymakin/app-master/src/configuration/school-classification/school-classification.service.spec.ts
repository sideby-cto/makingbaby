import { Test, TestingModule } from '@nestjs/testing';
import { SchoolClassificationService } from './school-classification.service';

describe('SchoolClassificationService', () => {
  let service: SchoolClassificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolClassificationService],
    }).compile();

    service = module.get<SchoolClassificationService>(SchoolClassificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
