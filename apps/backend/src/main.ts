import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .setDescription('Hospital Management System SaaS API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('tenants', 'Tenant management')
    .addTag('users', 'User management')
    .addTag('patients', 'Patient management')
    .addTag('staff', 'Staff management')
    .addTag('appointments', 'Appointment scheduling')
    .addTag('opd', 'Outpatient department')
    .addTag('ipd', 'Inpatient department')
    .addTag('pharmacy', 'Pharmacy management')
    .addTag('laboratory', 'Laboratory management')
    .addTag('billing', 'Billing and finance')
    .addTag('insurance', 'Insurance management')
    .addTag('hr', 'HR and payroll')
    .addTag('settings', 'System settings')
    .addTag('reports', 'Reports and analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 CareStack API running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/docs`);
}

bootstrap();
