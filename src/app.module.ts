import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { typeOrmModuleFactory } from '@uimssn/base_module/config/typeorm.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@uimssn/base_module/auth/auth.module';
import { UtilsModule } from '@uimssn/base_module/utils/utils.module';
import { LogsModule } from '@uimssn/base_module/logs/logs.module';
import { UserModule } from '@uimssn/base_module/user/user.module';
import { EmailServiceModule } from '@uimssn/base_module/email-service/email-service.module';
import { FileUploadModule } from '@uimssn/base_module/file-upload/file-upload.module';
import { BookCatalogueModule } from '@uimssn/modules/book-catalogue/book-catalogue.module';
import { LogsModule } from './logs/logs.module';


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
