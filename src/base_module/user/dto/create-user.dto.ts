import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '@uimssn/base_module/user/entities/user.entity';

export class CreateUserDto  {
  
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, { message: 'Password too weak' })
  password: string

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({ required: false  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 20)
  lastName?: string;

  @ApiProperty({required: false})
  // @IsString()
  middleName?: string;

  // @ApiProperty()
  // @IsEnum(["male", "female"], { message: "value must be male or female"})
  // gender?: UserGender;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  profilePicture?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;


  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  zipCode?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  state?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  country?: string

  @IsOptional()
  @IsString()
  mfa_secret?: string;

  @IsOptional()
  @IsString()
  recovery_code?: string;

  @IsOptional()
  @IsBoolean()
  is_mfa_started?: boolean;

  @IsOptional()
  @IsBoolean()
  is_mfa_enabled?: boolean;

  // @ApiProperty()
  role: UserRole;

}