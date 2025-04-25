import { Controller, Get } from '@nestjs/common';
import { MonologService } from './monolog.service';

@Controller()
export class MonologController {
  constructor(private readonly monologService: MonologService) {}

  @Get()
  getHello(): string {
    return this.monologService.getHello();
  }
}
