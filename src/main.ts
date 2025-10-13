import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from '@uimssn/base_module/config/logger.config';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppDataSource } from '@uimssn/base_module/config/typeorm.config';
import { Logger } from '@nestjs/common';
import { AppExceptionFilter } from '@uimssn/base_module/app-exception.filter';
import { ValidationPipe } from '@uimssn/base_module/utils/validation.pipe';
import { ResponseFormatterMiddleware } from '@uimssn/base_module/utils/response-formatter.middleware';



// @ts-ignore
const logger = new Logger('main.ts');

async function bootstrap() {

  try{
    await AppDataSource.initialize();
    logger.log('Data Source has been initialized!');
  }catch (err) {
    logger.error('Error during Data Source initialization', err);
    process.exit(1); // Exit if the DB initialization fails
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
    bufferLogs: true,
    snapshot: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const corsMaxAge = configService.get<number>('CORS_MAX_AGE');
  const helmetContentSecurityPolicy = {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [
        `'self'`,
        `'unsafe-inline'`,
        'unpkg.com',
        'cdn.jsdelivr.net',
        'fonts.googleapis.com',
      ],
      connectSrc: [`'self'`, `unpkg.com`],
      fontSrc: [`'self'`, 'fonts.gstatic.com'],
      imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
      scriptSrc: [
        `'self'`,
        `'unsafe-eval'`,
        `https: 'unsafe-inline'`,
        `cdn.jsdelivr.net`,
        `unpkg.com`,
      ],
    },
  };




  app.use(
    compression({
      threshold: 1024, // Only compress responses > 1KB
      level: 6, // zlib compression level (0-9)
      filter: (req, res) => {
        // Conditionally compress
        if (req.headers['x-no-compress']) return false;
        return compression.filter(req, res);
      },
    }),
  );

  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
  app.setGlobalPrefix('/api');


  // Set global prefix for all API routes
  // app.setGlobalPrefix('api');

  // Configure static file serving
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static',
  });

  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: corsMaxAge,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.disable('x-powered-by');
  app.useGlobalPipes(new ValidationPipe())

  const config = new DocumentBuilder()
    .setTitle('Edu Bridge API')
    .setDescription('API documentation for the Edu Bridge application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const docuement = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, docuement);
  app.use(
    '/api-docs',
    basicAuth({
      users: { admin: process.env.BASIC_AUTH_PASSWORD || 'password' },
      challenge: true,
      realm: 'API Docs',
      unauthorizedResponse: 'Unauthorized access to API documentation',
    }),
  );

  app.use(helmet({
    contentSecurityPolicy: helmetContentSecurityPolicy
  }));
  // app.use(cookieParser());
  // app.use(csurf({ cookie: true }));
  // app.use(rateLimit({ windowMs: 15*60*1000, max: 100 })); // 15 minutes, 100 requests

  app.useGlobalFilters(new AppExceptionFilter(app.get(HttpAdapterHost)));
  app.use(new ResponseFormatterMiddleware().use);
  // app.useGlobalGuards()



  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  console.log('Documentation Created successfully.');

  await app.listen(port ?? 3001, () => {
    logger.log(`Application started at port:${port}`);
  });
}
bootstrap();
