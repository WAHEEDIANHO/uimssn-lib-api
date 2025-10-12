import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ArrayNotEmpty,
} from 'class-validator';
import { BookCatalogueCategoriesEnum } from '../enums/book-catalogue-categories..enum';
import { BookCatalogueTypeEnum } from '../enums/book-catalogue-type.enum';
import { BookCatalogueFileFormatEnum } from '../enums/book-catalogue-file-format';
import { FacultyEnum } from '../enums/faculty.enum';
import { ValidateProjectCategory } from '../decorators/validate-project-category.decorator/validate-project-category.decorator.decorator';

export class CreateBookCatalogueDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author: string;

  @ApiProperty({
    isArray: true,
    enum: BookCatalogueCategoriesEnum,
    description: 'List of categories. Note: When Final Year Project is selected, no other categories can be selected',
    example: [BookCatalogueCategoriesEnum.BUSINESS, BookCatalogueCategoriesEnum.DESIGN],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(BookCatalogueCategoriesEnum, { each: true })
  @ValidateProjectCategory()
  categories: BookCatalogueCategoriesEnum[];

  @ApiProperty({ enum: BookCatalogueTypeEnum })
  @IsEnum(BookCatalogueTypeEnum)
  type: BookCatalogueTypeEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ maxLength: 255, description: 'Cover image URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  // @IsUrl()
  coverImage: string;

  @ApiProperty({ maxLength: 255, description: 'File URL (PDF/EPUB/etc.)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  // @IsUrl()
  fileUrl: string;

  @ApiProperty({ enum: BookCatalogueFileFormatEnum })
  @IsEnum(BookCatalogueFileFormatEnum)
  fileFormat: BookCatalogueFileFormatEnum;

  @ApiPropertyOptional({ maxLength: 255, description: 'Optional project link URL' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  // @IsUrl()
  projectLink?: string;

  @ApiPropertyOptional({ enum: FacultyEnum })
  @IsOptional()
  @IsEnum(FacultyEnum)
  faculty?: FacultyEnum;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isLibrarianPick?: boolean;
}