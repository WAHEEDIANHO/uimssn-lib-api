import { PaginationQueryDto } from "@uimssn/base_module/utils/dto/pagination-query.dto";
import { BookCatalogue } from "../entities/book-catalogue.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class BookCatalogueQueryDto extends PaginationQueryDto<BookCatalogue> {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    searchFields: string = "title,description,author,isbn";

    @ApiProperty({ required: false, example: "arrAny:Islamic Books" })
    @IsOptional()
    @IsString()
    categories?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    faculty?: string;
}
