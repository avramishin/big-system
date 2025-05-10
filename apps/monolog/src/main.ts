require('dotenv').config({ path: __dirname + '/../../../.env' });

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { MonologModule } from './monolog.module';
import { AllExceptionsFilter } from '../../common/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    MonologModule,
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

  const port = configService.get<number>('MONOLOG_PORT');
  console.log(`⚡️ MONOLOG IS RUNNING AT http://localhost:${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
