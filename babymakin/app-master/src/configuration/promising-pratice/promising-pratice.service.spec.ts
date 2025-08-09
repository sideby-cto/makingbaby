import { Test, TestingModule } from '@nestjs/testing';
import { PromisingPraticeService } from './promising-pratice.service';

describe('PromisingPraticeService', () => {
  let service: PromisingPraticeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromisingPraticeService],
    }).compile();

    service = module.get<PromisingPraticeService>(PromisingPraticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
