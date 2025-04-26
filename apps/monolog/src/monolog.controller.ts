import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { MonologService } from './monolog.service';
import { CreateLogDto } from './dto/create-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';
import { parseSafeJson } from '../../common/parse-safe-json';

@Controller()
export class MonologController {
  constructor(private readonly monologService: MonologService) {}

  @Post('v1/logs')
  async register(@Body() dto: CreateLogDto) {
    return await this.monologService.createLog(dto);
  }

  @Get('v1/logs/search')
  async search(@Query() dto: SearchLogsDto) {
    const logs = await this.monologService.searchLogs(dto);
    logs.forEach((log) => {
      if (log.ctx) {
        log.ctx = parseSafeJson(log.ctx);
      }
    });

    return logs;
  }

  @Delete('v1/logs/delete-expired')
  async deleteExpired() {
    return await this.monologService.deleteExpiredLogs();
  }

  @Delete('v1/logs/delete-all')
  async deleteAll() {
    return await this.monologService.deleteAllLogs();
  }
}
