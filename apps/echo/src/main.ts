import { NestFactory } from '@nestjs/core';
import { EchoModule } from './echo.module';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../../common/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    EchoModule,
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

  const port = configService.get<number>('ECHO_PORT');
  console.log(`ECHO PORT ${port}`);

  await app.listen(port, '0.0.0.0');
}
bootstrap();
