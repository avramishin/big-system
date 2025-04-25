import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
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

  await app.register(fastifyCors, {
    credentials: true,
  });

  await app.register(fastifyCompress);

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.init();
  await app.listen(process.env.API_PORT ?? 3000, '0.0.0.0');
}
bootstrap();
