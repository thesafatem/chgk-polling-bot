import { Test, TestingModule } from '@nestjs/testing';
import { ChgkService } from './chgk.service';

describe('ChgkService', () => {
  let service: ChgkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChgkService],
    }).compile();

    service = module.get<ChgkService>(ChgkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
