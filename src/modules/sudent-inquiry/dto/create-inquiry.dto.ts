import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { InquiryReason } from "../enums";
import { FacultyEnum } from "../../book-catalogue/enums/faculty.enum";


export class CreateInquiryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Length(10, 50)
    message: string;

    @ApiProperty()
    @IsEnum(InquiryReason)
    @IsNotEmpty()
    reason: InquiryReason;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty()
    @IsEnum(FacultyEnum)
    @IsNotEmpty()
    faculty: FacultyEnum;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    department: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    matricNo: string;
}