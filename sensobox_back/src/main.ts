import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './auth/infrastructure/config/swagger.config';

async function bootstrap() {
  dotenv.config();
  const logger = new Logger('Initialization');

  const app = await NestFactory.create(AppModule);

  // Habilita CORS
  app.enableCors({
    origin: '*', // Esto permite solicitudes desde cualquier origen
    // Para producción, es recomendable restringir el origen a los dominios de confianza
    // origin: 'https://www.tu-dominio.com'
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);
  logger.log('Swagger has been set up at /api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}

bootstrap();
