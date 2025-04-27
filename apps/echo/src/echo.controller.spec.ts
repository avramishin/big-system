import { Test, TestingModule } from '@nestjs/testing';
import { EchoController } from './echo.controller';
import { EchoService } from './echo.service';

describe('EchoController', () => {
  let echoController: EchoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EchoController],
      providers: [EchoService],
    }).compile();

    echoController = app.get<EchoController>(EchoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(echoController.getHello()).toBe('Hello World!');
    });
  });
});
