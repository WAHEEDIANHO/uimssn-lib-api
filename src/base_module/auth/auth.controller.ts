import {
  Body,
  Controller,
  Get,
  HttpStatus, Param,
  Post,
  Req,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';

import { ApiExcludeController, ApiExcludeEndpoint, ApiProperty, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from './guard/auth.guard';
import { Roles } from './decorator/role.decorator';
import { AuthService } from '@uimssn/base_module/auth/auth.service';
import { UserService } from '@uimssn/base_module/user/user.service';
import { ValidationPipe } from '@uimssn/base_module/utils/validation.pipe';
import { LoginDto } from '@uimssn/base_module/auth/dto/login.dto';
import { IGoogleUser } from '@uimssn/base_module/auth/types/i-google.user';
import { UserRole } from '@uimssn/base_module/user/entities/user.entity';
import { ForgetPasswordDto } from '@uimssn/base_module/auth/dto/forgot-password.dto';
import { VerifyForgetPasswordDto } from '@uimssn/base_module/auth/dto/verify-forget-password.dto';
import { RoleEnum } from '../user/enums/role.enum';
import { CreateUserDto } from '@uimssn/base_module/user/dto/create-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @Post('login')
  async login(@Body(new ValidationPipe()) loginDto: LoginDto, @Res() res: Response): Promise<Response> {
    const { access_token, refresh_token, user } = await this.authService.login(loginDto);
    delete user?.password;
    delete user?.createdAt;
    delete user?.updatedAt;
    // const accountNo = await this.walletService.getWalletByUserEmail(loginDto.email);
    return res
      .status(HttpStatus.OK)
      .json(
        res.formatResponse(HttpStatus.OK, 'login successfully', {
          access_token,
          refresh_token,
          user: {
            ...user,
            name: user.fullNameWithInitial,
            // accountNo: accountNo?.accountNo
          }
        }),
      );
  }

  @Post('signup')
  async signup(@Body(new ValidationPipe()) createUserDto: CreateUserDto, @Res() res: Response): Promise<Response> {
    createUserDto.role = RoleEnum.USER;
    const user = await this.userService.createUser(createUserDto);
    if (user == null) throw new BadRequestException("unable to create user");

    await this.authService.generateOtp(createUserDto.email);

    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "User created successfully. Please verify your email with the OTP sent.", user));
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)
  @Post('admin')
  async createAdmin(@Body(new ValidationPipe()) createUserDto: CreateUserDto, @Res() res: Response): Promise<Response> {
    createUserDto.role = RoleEnum.ADMIN;
    const user = await this.userService.createUser(createUserDto);
    if (user == null) throw new BadRequestException("unable to create user");

    await this.authService.generateOtp(createUserDto.email);

    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "User created successfully. Please verify your email with the OTP sent.", user));
  }

  @Post("resend-otp")
  async resendOtp(@Body(new ValidationPipe()) resendOtp: ResendOtpDto, @Res() res: Response): Promise<Response> {
    const {email} = resendOtp;
    const user = await this.userService.findByUsername(email);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "User not found", {}));
    }
    if (user.isEmailVerified) {
      return res.status(HttpStatus.BAD_REQUEST).json(res.formatResponse(HttpStatus.BAD_REQUEST, "User is already verified", {}));
    }

    await this.authService.generateOtp(email);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "OTP sent successfully", {}));
  }

  @Post('refreshToken')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ): Promise<Response> {
    const response = await this.authService.refreshToken(refreshToken);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, 'new refreshToken', response));
  }

  @Get('google')
  // @UseGuards(AuthGuard('google'))
  async signWithGoogle(@Res() res: Response) { }

  @ApiExcludeEndpoint()
  @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Res() res: Response, @Req() req: Request) {
    const googleUser = req.user as IGoogleUser;
    let user = await this.userService.findByUsername(
      googleUser.email,
    );
    if (user != null && user?.googleId != null) {
      // User already register just logged them in and  get token
      const { access_token, user } = await this.authService.login({
        email: googleUser.email,
        password: googleUser.id, // Using Google ID as password for login
      });
      return res
        .status(HttpStatus.OK)
        .json(
          res.formatResponse(HttpStatus.OK, 'login successfully', {
            access_token,
            user,
          }),
        );
    } else if (user != null && user?.googleId == null)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          res.formatResponse(
            HttpStatus.BAD_REQUEST,
            'User already exists but not registered with Google',
          ),
        );
    else {
      // User not registered, create a new user
      const newUser = await this.userService.createUser({
        email: googleUser.email,
        password: googleUser.id, // Using Google ID as password for registration
        role: RoleEnum.USER, // Default role
        fullName: `${googleUser.firstName} ${googleUser.lastName}`,
        // gender: UserGender.m,
      }, googleUser.id, true);

      const { access_token, user } = await this.authService.login({
        email: googleUser.email,
        password: googleUser.id, // Using Google ID as password for login
      });

      return res
        .status(HttpStatus.OK)
        .json(
          res.formatResponse(HttpStatus.OK, 'login successfully', {
            access_token,
            user,
          }),
        );
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtp: VerifyOtpDto, @Res() res: Response): Promise<Response> {
    const { email, otp } = verifyOtp;
    const user = await this.userService.findByUsername(email);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, 'User not found', {}));
    }
    if (user.isEmailVerified) {
      return res.status(HttpStatus.BAD_REQUEST).json(res.formatResponse(HttpStatus.BAD_REQUEST, 'User already verified', {}));
    }

    const isValid = await this.authService.verifyOtp(email, otp);
    if (!isValid) {
      return res.status(HttpStatus.BAD_REQUEST).json(res.formatResponse(HttpStatus.BAD_REQUEST, 'Invalid or expired OTP', {}));
    }

    await this.userService.verifyUserById(user.id);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, 'Email verified successfully', {}));
  }

  @Post("forgot-password")
  async forgotPassword(@Body(new ValidationPipe()) forgetPasswordDto: ForgetPasswordDto, @Res() res: Response): Promise<Response> {

    const user = await this.userService.findByUsername(forgetPasswordDto.email);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, 'User not found', {}));
    }
    if (!user.isEmailVerified) {
      return res.status(HttpStatus.BAD_REQUEST).json(res.formatResponse(HttpStatus.BAD_REQUEST, 'User is not verified', {}));
    }
    // Logic to send reset password email
    // console.log(otp)
    await this.authService.generateOtp(user.email, 'reset_password');
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, 'Reset password email sent', {}));
  }

  @Post("verify-forgot-password")
  async verifyForgotPassword(@Body(new ValidationPipe()) verifyDto: VerifyForgetPasswordDto, @Body('newPassword') newPassword: string, @Res() res: Response): Promise<Response> {
    const { password, confirmPassword, email, otp } = verifyDto;
    if (password !== confirmPassword) {
      return res.status(HttpStatus.BAD_REQUEST).json(res.formatResponse(HttpStatus.BAD_REQUEST, 'Passwords do not match', {}));
    }

    const user = await this.userService.findByUsername(email);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, 'User not found', {}));
    }

    // Logic to verify the token and reset the password
    if (!await this.authService.verifyOtp(email, otp)) {
      return res.status(HttpStatus.BAD_REQUEST).json(res.formatResponse(HttpStatus.BAD_REQUEST, 'Invalid OTP', {}));
    }
    await this.userService.changePassword(user, password);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, 'Password reset successfully', {}));
  }
} 