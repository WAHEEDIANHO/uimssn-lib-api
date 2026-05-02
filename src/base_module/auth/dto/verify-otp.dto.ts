import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches } from "class-validator";


export class VerifyOtpDto {
      @ApiProperty({ required: true })
      @IsEmail()
      email: string;
      
      @ApiProperty({ required: true })
      @IsString()
      @Matches(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit number' })
      otp: string;
}