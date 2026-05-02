import { PaginationQueryDto } from "@uimssn/base_module/utils/dto/pagination-query.dto";
import { InquiryEntity } from "../entities/inquiry.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { InquiryReason, InquiryStatus } from "../enums";


export class QueryInquiryDto extends PaginationQueryDto<InquiryEntity> {

    @ApiProperty()
    @IsString()
    @IsOptional()
    status: InquiryStatus;

    @ApiProperty()
    @IsString()
    @IsOptional()
    reason: InquiryReason;

    @ApiProperty()
    @IsString()
    @IsOptional()
    searchFields: string = 'fullName,phoneNumber,matricNo,message,reason,faculty,department';
}