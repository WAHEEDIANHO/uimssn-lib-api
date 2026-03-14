import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode';
import { HashPassword } from '@uimssn/base_module/utils/hash-password';
import { EmailServiceService } from '@uimssn/base_module/email-service/email-service.service';
import { CreateUserDto } from '@uimssn/base_module/user/dto/create-user.dto';
import { UpdateUserDto } from '@uimssn/base_module/user/dto/update-user.dto';
import { AccountStatusEnum } from '@uimssn/base_module/user/enums/account-status.enum';


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
  ) { }

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

  async remove(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return await this.userModel.remove(user);
  }


  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }

} 