import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UtilsModule } from './built-in/utils/utils.module';
import { AuthModule } from './built-in/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EmailServiceModule } from './built-in/email-service/email-service.module';
import { UserModule } from './built-in/user/user.module';
import { FileUploadModule } from './built-in/file-upload/file-upload.module';
import { typeOrmModuleFactory } from './built-in/config/typeorm.config';
import { JwtModule } from '@nestjs/jwt';
import { LogsModule } from './built-in/logs/logs.module';
import { BookCatalogueModule } from './modules/book-catalogue/book-catalogue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [
        // ConfigModule,
        CacheModule.register({
          ttl: 5000, // seconds
        }),
      ],
      useFactory: (configService: ConfigService) =>
        typeOrmModuleFactory(configService),
      inject: [ConfigService],
    }),

    JwtModule.register({ global: true }),

    // WinstonModule.forRoot({
    //   transports: [
    //     new winston.transports.Console({format: winston.format.simple()}),
    //     new winston.transports.File({
    //       filename: 'error.log',
    //       level: 'error'
    //     }),
    //     new winston.transports.File({filename: 'combined.log'})
    //   ]
    // }),

    AuthModule,
    UtilsModule,

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minute
          limit: 5,
        },
      ],
    }),
    LogsModule,
    UserModule,
    EmailServiceModule,
    FileUploadModule,
    BookCatalogueModule,
    // ScheduleModule.forRoot()
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
