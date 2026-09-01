import { Test, TestingModule } from '@nestjs/testing';
import { ExhibitionsController } from './exhibitions.controller';

describe('ExhibitionsController', () => {
  let controller: ExhibitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExhibitionsController],
    }).compile();

    controller = module.get<ExhibitionsController>(ExhibitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
