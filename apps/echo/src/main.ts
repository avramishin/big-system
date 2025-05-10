require('dotenv').config({ path: __dirname + '/../../../.env' });

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';

import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../../common/filters/all-exception.filter';
import { EchoModule } from './echo.module';
import fastifyCors from '@fastify/cors';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    EchoModule,
    new FastifyAdapter(),
    { logger: console },
  );

  const configService = app.get(ConfigService);

  await app.register(fastifyCors, {
    credentials: true,
  });

  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableShutdownHooks();
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.init();

  const port = configService.get<number>('ECHO_PORT');
  console.log(`⚡️ ECHO IS RUNNING AT http://localhost:${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
