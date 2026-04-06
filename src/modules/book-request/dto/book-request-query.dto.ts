import { PaginationQueryDto } from "@uimssn/base_module/utils/dto/pagination-query.dto";
import { BookRequest } from "../entities/book-request.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { FacultyEnum } from "@uimssn/modules/book-catalogue/enums/faculty.enum";
import { BookRequestStatusEnum } from "../enums/book-request-status.enum";


export class BookRequestQueryDto extends PaginationQueryDto<BookRequest> {

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    searchFields: string = "fullName,whatsAppNumber,matricNo,department,reason";

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(FacultyEnum)
    faculty?: FacultyEnum;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(BookRequestStatusEnum)
    status?: BookRequestStatusEnum;

}
