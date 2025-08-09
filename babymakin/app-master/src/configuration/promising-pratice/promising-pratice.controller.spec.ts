import { Test, TestingModule } from '@nestjs/testing';
import { PromisingPraticeController } from './promising-pratice.controller';
import { PromisingPraticeService } from './promising-pratice.service';

describe('PromisingPraticeController', () => {
  let controller: PromisingPraticeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromisingPraticeController],
      providers: [PromisingPraticeService],
    }).compile();

    controller = module.get<PromisingPraticeController>(
      PromisingPraticeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
