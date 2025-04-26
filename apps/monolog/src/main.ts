import { NestFactory } from '@nestjs/core';
import { MonologModule } from './monolog.module';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    MonologModule,
    new FastifyAdapter(),
    { logger: console },
  );

  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.init();

  const port = configService.get<number>('MONOLOG_PORT');
  console.log(`MONOLOG PORT ${port}`);

  await app.listen(port, '0.0.0.0');
}
bootstrap();
