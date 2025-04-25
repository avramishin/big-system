import { Test, TestingModule } from '@nestjs/testing';
import { MonologController } from './monolog.controller';
import { MonologService } from './monolog.service';

describe('MonologController', () => {
  let monologController: MonologController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MonologController],
      providers: [MonologService],
    }).compile();

    monologController = app.get<MonologController>(MonologController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(monologController.getHello()).toBe('Hello World!');
    });
  });
});
