import { Body, Controller, Get, Post } from '@nestjs/common';
import { MonologService } from './monolog.service';
import { CreateLogDto } from './dto/create-log.dto';

@Controller()
export class MonologController {
  constructor(private readonly monologService: MonologService) {}

  @Post('v1/logs')
  async createLog(@Body() dto: CreateLogDto) {
    return await this.monologService.createLog(dto);
  }
}
