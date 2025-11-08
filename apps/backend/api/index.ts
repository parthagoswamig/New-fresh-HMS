import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    // Enable CORS
    const corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000'];
    
    app.enableCors({
      origin: corsOrigins.length > 0 ? corsOrigins : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'X-Tenant-ID', 'x-user-id', 'X-User-ID', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('CareStack API')
      .setDescription('Hospital Management System SaaS API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication')
      .addTag('tenants', 'Tenant Management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.init();
  }
  return server;
}

export default async (req, res) => {
  const server = await bootstrap();
  return server(req, res);
};
