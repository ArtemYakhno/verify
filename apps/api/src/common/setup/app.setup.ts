import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { validationConfig } from '../configs/validation.config';
import { corsConfig } from '../configs/cors.config';
import { setupSwagger } from './swagger.setup';
import { GlobalExceptionFilter } from '../filters/http-exception.filter';

export function setupApp(app: INestApplication): void {
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.enableCors(corsConfig);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validationConfig));
  app.useGlobalFilters(new GlobalExceptionFilter());

  setupSwagger(app);
}
