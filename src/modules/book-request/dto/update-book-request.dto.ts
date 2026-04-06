import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BookRequestStatusEnum } from '../enums/book-request-status.enum';

export class UpdateBookRequestDto {
    @ApiProperty()
    @IsEnum(BookRequestStatusEnum)
    @IsOptional()
    status: BookRequestStatusEnum;

}
