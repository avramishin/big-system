import { Controller, Get } from '@nestjs/common';
import { EchoService } from './echo.service';

@Controller()
export class EchoController {
  constructor(private readonly echoService: EchoService) {}

  @Get()
  getHello(): string {
    return this.echoService.getHello();
  }
}
