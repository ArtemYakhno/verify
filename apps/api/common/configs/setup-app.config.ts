import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

export function setupApp(app: INestApplication): void {
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const result = errors.reduce(
          (acc, error) => {
            acc[error.property] = Object.values(error.constraints ?? {});
            return acc;
          },
          {} as Record<string, string[]>,
        );
        return new BadRequestException(result);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Verify API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
