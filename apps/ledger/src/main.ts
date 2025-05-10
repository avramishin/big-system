require('dotenv').config({ path: __dirname + '/../../../.env' });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AllExceptionsFilter } from '../../common/filters/all-exception.filter';
import { LedgerModule } from './ledger.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    LedgerModule,
    new FastifyAdapter(),
    { logger: console },
  );

  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.init();

  const port = configService.get<number>('LEDGER_PORT');
  console.log(`⚡️ LEDGER IS RUNNING AT http://localhost:${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
