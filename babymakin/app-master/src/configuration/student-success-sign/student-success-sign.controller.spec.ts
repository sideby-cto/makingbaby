import { Test, TestingModule } from '@nestjs/testing';
import { StudentSuccessSignController } from './student-success-sign.controller';
import { StudentSuccessSignService } from './student-success-sign.service';

describe('StudentSuccessSignController', () => {
  let controller: StudentSuccessSignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentSuccessSignController],
      providers: [StudentSuccessSignService],
    }).compile();

    controller = module.get<StudentSuccessSignController>(
      StudentSuccessSignController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
