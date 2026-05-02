import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { VerifyOtpDto } from './verify-otp.dto';

export class  VerifyForgetPasswordDto extends VerifyOtpDto {
  @ApiProperty({ required: true })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Password too weak' })
  password: string
  @ApiProperty({ required: true })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Confirm Password too weak' })
  confirmPassword: string;
}