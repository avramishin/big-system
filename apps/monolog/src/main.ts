import { NestFactory } from '@nestjs/core';
import { MonologModule } from './monolog.module';

async function bootstrap() {
  const app = await NestFactory.create(MonologModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
