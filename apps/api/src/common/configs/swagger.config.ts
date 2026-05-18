import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Verify API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
