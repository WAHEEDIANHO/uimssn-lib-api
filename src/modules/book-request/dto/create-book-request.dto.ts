import { ApiProperty } from "@nestjs/swagger";
import { FacultyEnum } from "@uimssn/modules/book-catalogue/enums/faculty.enum";
import { IsEnum, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateBookRequestDto {
    @ApiProperty()
    @IsUUID()
    bookId: string;

    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsString()
    whatsAppNumber: string;

    @ApiProperty()
    @IsNumber()
    matricNo: number;

    @ApiProperty()
    @IsEnum(FacultyEnum)
    faculty: FacultyEnum;

    @ApiProperty()
    @IsString()
    department: string;

    @ApiProperty()
    @IsString()
    reason: string;
    
}
