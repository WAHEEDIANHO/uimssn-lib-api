import { PaginationQueryDto } from "@uimssn/base_module/utils/dto/pagination-query.dto";
import { FAQEntity } from "../entities/faq.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";



export class QueryFAQDto extends PaginationQueryDto<FAQEntity> {
    @ApiProperty()
    @IsString()
    @IsOptional()
    searchFields: string = "question,answer";
}