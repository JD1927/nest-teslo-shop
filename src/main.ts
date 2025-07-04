import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');
  // Setting Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      // Removes the extra fields sent throughout the request
      // Just keeps the ones on the DTO
      whitelist: true,
      // Emits an error when there are extra fields on a request
      // Indicates which property is not part of the DTO
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        // Excludes fields that are undefined on the request
        exposeUnsetFields: false,
        // Enables implicit conversion for DTO's
        enableImplicitConversion: true,
      },
    }),
  );

  // Documentation
  const config = new DocumentBuilder()
    .setTitle('Teslo REST API')
    .setDescription('Teslo REST API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`App running on port:${port}`);
}
bootstrap();
