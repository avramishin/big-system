import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { WsAdapter } from '@nestjs/platform-ws';
import { ValidationPipe } from '@nestjs/common';

import fastifyCors from '@fastify/cors';
import fastifyCompress from '@fastify/compress';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: console },
  );

  const configService = app.get(ConfigService);

  await app.register(fastifyCors, {
    credentials: true,
  });

  await app.register(fastifyCompress);

  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.init();
  await app.listen(configService.get<number>('API_PORT'), '0.0.0.0');
}
bootstrap();
