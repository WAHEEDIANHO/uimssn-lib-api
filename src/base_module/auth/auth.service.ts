import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@uimssn/base_module/user/user.service';
import { HashPassword } from '@uimssn/base_module/utils/hash-password';
import { Otp } from '@uimssn/base_module/auth/entities/otp.entity';
import { EmailServiceService } from '@uimssn/base_module/email-service/email-service.service';
import { LoginDto } from '@uimssn/base_module/auth/dto/login.dto';
import { AccountStatusEnum } from '@uimssn/base_module/user/enums/account-status.enum';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly hashPassword: HashPassword,
    @InjectRepository(Otp) private readonly otpServices: Repository<Otp>,
    private readonly emailService: EmailServiceService,
    private readonly hashText: HashPassword,
    private configService: ConfigService,
  ) {}

  async login(loginAuthDto: LoginDto): Promise<any>
  {
    const user = await this.userService.findByUsername(loginAuthDto.email);

    console.log(user);

    if (!user) throw new UnauthorizedException("Invalid login credential");
    if( !user.isEmailVerified && user.accountStatus != AccountStatusEnum.ACTIVE) throw new UnauthorizedException("Email is not verified");
    if (!(await this.hashPassword.comparePasswordAsync(loginAuthDto.password, user.password as string))) {
      throw new UnauthorizedException("Invalid login credential");
    }



    const payload = { username: user.username, sub: user.id, role: user.userType, isAdmin: user.isAdmin };
    const {accessToken, refreshToken} = await this.getTokens(payload);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,//this.jwtService.sign(payload),
      user: user
    };
  }

  async generateOtp(email: string): Promise<string> {
      const otp  = Math.floor(Math.random() * 900000 + 100000).toString(); // Generate a random 6-digit OTP
      let existingOtp = await this.otpServices.findOne({ where: { email } });
      if (existingOtp) {
        // If an OTP already exists for this email, update it
        existingOtp.otp = await this.hashText.hashPasswordAsync(otp);
        await this.otpServices.save(existingOtp);
      } else {
        const encryptedOtp = await this.hashText.hashPasswordAsync(otp);
        const storeOtp = new Otp()
        storeOtp.email = email;
        storeOtp.otp = encryptedOtp;
        await this.otpServices.save(storeOtp);
      }
      await this.emailService.sendOtpMail({otp, email})
      return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const existingOtp = await this.otpServices.findOne({ where: { email } });
    console.log(existingOtp, "====================================");
    if (!existingOtp) {
      return false;
    }
    const isValid = await this.hashText.comparePasswordAsync(otp, existingOtp.otp);
    console.log(isValid);
    if (isValid) {
      // Optionally, you can delete the OTP after successful verification
      await this.otpServices.delete(existingOtp.id);
      return true;
    }
    return false;
  }

  async getTokens(jwtPayload: any): Promise<{ accessToken: string, refreshToken: string }> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION_TIME'),
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async refreshToken(rt: string) {
      const data = this.jwtService.verify(rt, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      if (!data) throw new ForbiddenException('Access Denied');
      const { id, roleType, firstLoginId } = data;
      const { accessToken } = await this.getTokens({
        roleType,
        id,
        firstLoginId,
      });

      return { accessToken };
  }
}