import { Test, TestingModule } from '@nestjs/testing';
import { StudentSuccessSignService } from './student-success-sign.service';

describe('StudentSuccessSignService', () => {
  let service: StudentSuccessSignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentSuccessSignService],
    }).compile();

    service = module.get<StudentSuccessSignService>(StudentSuccessSignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
