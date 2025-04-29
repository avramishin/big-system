import { Module } from '@nestjs/common';
import { EchoController } from './echo.controller';
import { EchoService } from './echo.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EchoGateway } from './echo.gateway';

import configuration from './config/configuration';
import { MonologClient } from '../../monolog/src/monolog.client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
  ],
  controllers: [EchoController],
  providers: [
    EchoService,
    EchoGateway,
    {
      provide: 'monolog',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return new MonologClient(
          configService.get('ECHO_MONOLOG_URL'),
          configService.get('CLUSTER_CLIENT_KEY'),
          'ECHO',
          5_000,
        );
      },
    },
  ],
})
export class EchoModule {}
