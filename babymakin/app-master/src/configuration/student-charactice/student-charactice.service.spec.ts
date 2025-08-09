import { Test, TestingModule } from '@nestjs/testing';
import { StudentCharacticeService } from './student-charactice.service';

describe('StudentCharacticeService', () => {
  let service: StudentCharacticeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentCharacticeService],
    }).compile();

    service = module.get<StudentCharacticeService>(StudentCharacticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
