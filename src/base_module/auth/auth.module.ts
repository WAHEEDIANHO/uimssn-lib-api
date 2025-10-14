import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { EmailServiceModule } from '@uimssn/base_module/email-service/email-service.module';
import { UserModule } from '@uimssn/base_module/user/user.module';
import { User } from '@uimssn/base_module/user/entities/user.entity';
import { Otp } from '@uimssn/base_module/auth/entities/otp.entity';
import { AuthController } from '@uimssn/base_module/auth/auth.controller';
import { AuthService } from '@uimssn/base_module/auth/auth.service';
import { UserService } from '@uimssn/base_module/user/user.service';
import { HashPassword } from '@uimssn/base_module/utils/hash-password';
import { GoogleStrategy } from '@uimssn/base_module/utils/google.strategy';
import { EmailServiceService } from '@uimssn/base_module/email-service/email-service.service';
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
    ConfigModule,
    PassportModule,
    EmailServiceModule,
    UserModule,
    TypeOrmModule.forFeature([User, Otp]),
    // CacheModule.register({
    //   ttl: 30000, // seconds
    // })
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService,  HashPassword, GoogleStrategy, EmailServiceService, ExtractToken],
  exports: [],
})
export class AuthModule {}
