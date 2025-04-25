import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { HelloDto } from './dto/hello.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query() args: HelloDto) {
    return this.appService.getHello();
  }
}
