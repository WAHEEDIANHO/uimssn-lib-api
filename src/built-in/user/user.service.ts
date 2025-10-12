import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashPassword } from '../utils/hash-password';
import { JwtService } from '@nestjs/jwt';
import { EmailServiceService } from '../email-service/email-service.service';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountStatusEnum } from './enums/account-status.enum';
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode';


// import { ensureEntityExists } from '../utils/entity-exists';

@Injectable()
export class UserService {

  logger = new Logger('UserService');
  constructor(
    @InjectRepository(User) private userModel: Repository<any>,
    private hashPassword: HashPassword,
    private jwtService: JwtService,
    private emailService: EmailServiceService,
    private configService: ConfigService,
  ) {}

  async findByUsername(email: string): Promise<User> {
    // return this.userModel.findOne();
    const user = this.userModel.findOne({ where: { email } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = this.userModel.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async createUser(
    createUserDto: CreateUserDto,
    googleId?: string,
    isVerified?: boolean,
  ): Promise<User | null> {
    let user = await this.findByUsername(createUserDto.email);

    if (!user) {
      const newUser = this.userModel.create({
        username: createUserDto.email,
        ...createUserDto,

        // role: googleId ? UserRole.Student : UserRole.USER, // Default role
        googleId: googleId,
        isVerified,
      });

      newUser.password = await this.hashPassword.hashPasswordAsync(
        createUserDto.password,
      );
      user = await this.userModel.save(newUser);

      // const token = this.jwtService.sign({ id: user.id, email: user.email }, {expiresIn: "2 days"});
      // await this.emailService.sendVerificationMail({
      //   verificationUrl: "http://localhost:3000/auth/verify-email/" + token,
      //   email: user.email,
      //   name: `${user.firstName} ${user.lastName}`,
      // })
    }

    this.sendVerificationMail(user);
    return user;
  }

  async sendVerificationMail(user: User): Promise<void> {
    if (!user || !user.email) {
      this.logger.error('User data is required mail not sent');
      return;
      // throw new UnprocessableEntityException('User data is required');
    }

    const token = this.jwtService.sign(
      { id: user.id, email: user.email },
      { expiresIn: this.configService.get('JWT_EXPIRES_IN'), secret: this.configService.get('JWT_SECRET_KEY') },
    );
    await this.emailService.sendVerificationMail({
      verificationUrl:
        `${this.configService.get('BACKEND_BASE_URL')}/auth/verify-email/` +
        token,
      email: user.email,
      name: '', //`${user.firstName} ${user.lastName}`,
    });
    this.logger.log('mail sent');
  }

  async verifyUser(token: string): Promise<void> {
    const { id } = this.jwtService.verify(token, { secret: this.configService.get('JWT_SECRET_KEY') });
    const user = await this.findById(id);
    user.accountStatus = AccountStatusEnum.ACTIVE;
    user.isEmailVerified = true;
    await this.userModel.save(user);
    // console.log(val)
  }

  async saveUserAsync(user: User): Promise<User> {
    if (!user) throw new UnprocessableEntityException('User data is required');
    return await this.userModel.save(user);
  }

  async changePassword(user: User, newPassword: string) {
    if (!user) throw new UnprocessableEntityException('User data is required');
    if (!newPassword)
      throw new UnprocessableEntityException('New password is required');

    user.password = await this.hashPassword.hashPasswordAsync(newPassword);
    return await this.userModel.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    // Update user properties
    Object.assign(user, updateUserDto);

    // Hash password if it is provided
    if (updateUserDto.password) {
      user.password = await this.hashPassword.hashPasswordAsync(
        updateUserDto.password,
      );
    }

    return await this.userModel.save(user);
  }

  async enableMfa(userId: string) {
    const user = await this.findById(userId);

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `teracare (${user.email})`,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url as string);

    await this.update(userId, {
      mfa_secret: secret.base32,
      is_mfa_started: true,
    });

    return { QRCode: qrCode };
  }

  async disableMfa(userId: string, code: string) {
    const user = await this.findById(userId);
    if (!this.verifyMfaCode(user.mfa_secret, code)) {
      throw new BadRequestException('Invalid MFA code');
    }

    await this.update(userId, {
      mfa_secret: undefined,
      is_mfa_enabled: false,
      recovery_code: undefined,
    });

    return { message: 'MFA disabled' };
  }

  async toggleMfa(userId: string, action: 'enable' | 'disable') {
    const user = await this.findById(userId);

    if (action === 'disable') {
      await this.update(userId, {
        mfa_secret: undefined,
        is_mfa_enabled: false,
        recovery_code: undefined,
      });
      return { message: 'MFA disabled' };
    } else {
      const secret = speakeasy.generateSecret({
        length: 20,
        name: `teracare (${user.email})`,
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url as string);

      await this.update(userId, {
        mfa_secret: secret.base32,
        is_mfa_started: true,
      });

      return { QRCode: qrCode, secret: secret.base32 };
    }
  }



  private verifyMfaCode(secret: string, code: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
  }


  // async requestAccountDeletion(phoneNumber: string) {
  //   try {
  //     const standardizedPhone =
  //       this.internationalStandardizedNigerianPhoneNumber(phoneNumber);
  //
  //     this.logger.log(
  //       `User with phone ${standardizedPhone} requested account deletion`,
  //     );
  //     const user = await this.userRepository.findOne({
  //       where: { phoneNumber: standardizedPhone, isPhoneNumberVerified: true },
  //       relations: ['role'],
  //     });
  //
  //     if (!user) {
  //       throw new NotFoundException(
  //         'No verified account found with this phone number',
  //       );
  //     }
  //
  //     const verification_token = generateRandomNumber(4);
  //
  //     await this.otpService.storeOtp(
  //       standardizedPhone,
  //       user.id,
  //       user.role.roleType,
  //       verification_token,
  //       OtpPurpose.ACCOUNT_DELETION,
  //     );
  //
  //     await this.smsService.sendVerificationCode(
  //       standardizedPhone,
  //       user.id,
  //       user.role.roleType,
  //       OtpPurpose.ACCOUNT_DELETION,
  //       verification_token,
  //     );
  //
  //     return {
  //       message:
  //         'OTP sent to your phone number for account deletion verification',
  //       phoneNumber: standardizedPhone,
  //     };
  //   } catch (error) {
  //     this.logger.error(error);
  //     ErrorHandler.handleError('UserService.requestAccountDeletion', error);
  //   }
  // }
  //
  // async verifyAccountDeletionOtp(phoneNumber: string, code: string) {
  //   try {
  //     const standardizedPhone =
  //       this.internationalStandardizedNigerianPhoneNumber(phoneNumber);
  //
  //     const user = await this.userRepository.findOne({
  //       where: { phoneNumber: standardizedPhone, isPhoneNumberVerified: true },
  //       relations: ['role'],
  //     });
  //
  //     if (!user) {
  //       throw new NotFoundException(
  //         'No verified account found with this phone number',
  //       );
  //     }
  //
  //     const response = await this.otpService.verifyOtp({
  //       code,
  //       userId: user.id,
  //     });
  //
  //     if (response.purpose !== OtpPurpose.ACCOUNT_DELETION) {
  //       throw new BadRequestException('Invalid OTP purpose');
  //     }
  //
  //     // Generate a verification token for final confirmation
  //     const verificationToken = uuidv4();
  //
  //     // Store the verification token temporarily (you might want to add this to user schema or use cache)
  //     user.resetToken = verificationToken; // Reusing resetToken field for this purpose
  //     await this.userRepository.save(user);
  //
  //     return {
  //       message:
  //         'OTP verified successfully. Use the verification token to confirm account deletion.',
  //       verificationToken,
  //       expiresIn: '15 minutes',
  //     };
  //   } catch (error) {
  //     this.logger.error(error);
  //     ErrorHandler.handleError('UserService.verifyAccountDeletionOtp', error);
  //   }
  // }
  //
  // async confirmAccountDeletion(phoneNumber: string, verificationToken: string) {
  //   try {
  //     const standardizedPhone =
  //       this.internationalStandardizedNigerianPhoneNumber(phoneNumber);
  //
  //     const user = await this.userRepository.findOne({
  //       where: {
  //         phoneNumber: standardizedPhone,
  //         isPhoneNumberVerified: true,
  //         resetToken: verificationToken,
  //       },
  //       relations: ['role'],
  //     });
  //
  //     if (!user) {
  //       throw new NotFoundException(
  //         'Invalid verification token or phone number',
  //       );
  //     }
  //
  //     // // Check if token is still valid (15 minutes)
  //     // const tokenAge = Date.now() - user.updatedAt.getTime();
  //     // const fifteenMinutes = 15 * 60 * 1000;
  //
  //     // if (tokenAge > fifteenMinutes) {
  //     //   throw new UnauthorizedException('Verification token has expired');
  //     // }
  //
  //     // Perform account deletion
  //     await this.softDeleteUserAccount(user.id);
  //
  //     return {
  //       message: 'Account has been successfully deleted',
  //       deletedAt: new Date(),
  //     };
  //   } catch (error) {
  //     this.logger.error(error);
  //     ErrorHandler.handleError('UserService.confirmAccountDeletion', error);
  //   }
  // }
  //
  // private async softDeleteUserAccount(userId: string) {
  //   await this.userRepository.softDelete(userId);
  // }
  //
  // private async deleteUserAccount(userId: string) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //
  //   try {
  //     const user = await queryRunner.manager.findOne(UserEntity, {
  //       where: { id: userId },
  //       relations: ['role'],
  //     });
  //
  //     if (!user) {
  //       throw new BadRequestException('User not found');
  //     }
  //
  //     // Clean up related data
  //     if (user.role && user.role.createdBy?.id === userId) {
  //       await queryRunner.manager.update(
  //         RoleEntity,
  //         { createdBy: { id: userId } },
  //         { createdBy: null },
  //       );
  //     }
  //
  //     // Delete user
  //     await queryRunner.manager.delete(UserEntity, userId);
  //
  //     await queryRunner.commitTransaction();
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }


}