import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

  // Security
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(compression());

  // CORS — acepta el frontend configurado + localhost para desarrollo
  const isProduction = configService.get('NODE_ENV') === 'production';
  app.enableCors({
    origin: isProduction
      ? (origin: string | undefined, cb: Function) => cb(null, true) // acepta todos en producción (Railway/Vercel)
      : (origin: string | undefined, cb: Function) => cb(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EducAndes API')
    .setDescription('API REST para la plataforma educativa EducAndes / Allin Yachay')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('roles', 'Roles y permisos')
    .addTag('courses', 'Gestión de cursos')
    .addTag('lessons', 'Gestión de lecciones')
    .addTag('progress', 'Progreso académico')
    .addTag('forums', 'Foros de discusión')
    .addTag('notifications', 'Notificaciones')
    .addTag('dashboard', 'Dashboard y métricas')
    .addTag('audit', 'Auditoría del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  console.log(`\n🚀 EducAndes API corriendo en: http://localhost:${port}`);
  console.log(`📚 Swagger docs en: http://localhost:${port}/api/docs\n`);
}

bootstrap();
