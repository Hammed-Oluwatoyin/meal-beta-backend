import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { runSeed } from './database/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Migrations already ran during TypeOrmModule's initialization above
  // (migrationsRun: true), so the schema is ready for this.
  await runSeed(app.get(DataSource));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MealBeta API')
    .setDescription(
      'Backend API for the MealBeta patient and dietitian userflows',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
