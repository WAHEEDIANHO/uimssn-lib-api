import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsUUID } from "class-validator";

export class SetLibrarianPickDto {

    @ApiProperty()
    @IsArray()
    @IsUUID("4", { each: true })
    @ArrayMaxSize(3, { message: "Cannot provide more than 3 book IDs" })
    bookId: string[];
}


