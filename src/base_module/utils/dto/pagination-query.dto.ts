import { IsEnum, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEntity } from '@uimssn/base_module/utils/abstract/database/i-enity';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationQueryDto<T extends IEntity> {
  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  // When provided, enables page-number pagination (1-based). If omitted, cursor pagination is used.
  @ApiProperty({ required: false, description: '1-based page index; when provided, uses page-number pagination' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ required: false })
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiProperty({ required: false, type: "string" })
  @IsString()
  cursorField?: keyof T = 'id' as keyof T;  // default pagination field
}