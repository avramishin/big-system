import { Module } from '@nestjs/common';
import { MonologController } from './monolog.controller';
import { MonologService } from './monolog.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [MonologController],
  providers: [MonologService],
})
export class MonologModule {}
