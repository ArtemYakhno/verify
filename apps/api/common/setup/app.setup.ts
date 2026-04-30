// src/app.setup.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { validationConfig } from '../configs/validation.config';
import { corsConfig } from '../configs/cors.config';
import { setupSwagger } from './swagger.setup';

export function setupApp(app: INestApplication): void {
  app.enableCors(corsConfig);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validationConfig));
  setupSwagger(app);
}
