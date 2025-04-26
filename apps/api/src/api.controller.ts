import { Controller, Get, Query } from '@nestjs/common';
import { ApiService } from './api.service';
import { HelloDto } from './dto/hello.dto';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  getHello(@Query() args: HelloDto) {
    return this.apiService.getHello();
  }
}
