/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from '../common/configs/setup-app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApp(app);

  await app.listen(3000);
}
bootstrap();

// Backend works on http://localhost:3000
// Swagger: http://localhost:3000/api/docs;
