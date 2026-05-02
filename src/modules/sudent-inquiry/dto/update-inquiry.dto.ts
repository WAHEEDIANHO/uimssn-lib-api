import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { InquiryStatus } from "../enums";


export class UpdateInquiryDto {
    @ApiProperty()
    @IsEnum(InquiryStatus)
    @IsNotEmpty()
    status: InquiryStatus;
}