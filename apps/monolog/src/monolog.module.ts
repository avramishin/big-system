import { Module } from '@nestjs/common';
import { MonologController } from './monolog.controller';
import { MonologService } from './monolog.service';

@Module({
  imports: [],
  controllers: [MonologController],
  providers: [MonologService],
})
export class MonologModule {}
