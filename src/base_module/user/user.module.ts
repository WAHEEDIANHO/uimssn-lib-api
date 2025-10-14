import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@uimssn/base_module/user/entities/user.entity';
import { EmailServiceModule } from '@uimssn/base_module/email-service/email-service.module';
import { UserController } from '@uimssn/base_module/user/user.controller';
import { UserService } from '@uimssn/base_module/user/user.service';
import { HashPassword } from '@uimssn/base_module/utils/hash-password';
import { ExtractToken } from '@uimssn/base_module/utils/extract-token';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY'),
      }),
    }),
    TypeOrmModule.forFeature([User]),
    EmailServiceModule,
    ConfigModule
  ],
  controllers: [UserController],
  providers: [UserService, HashPassword, ExtractToken],
  exports: [UserService],
})
export class UserModule {}
