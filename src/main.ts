import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
