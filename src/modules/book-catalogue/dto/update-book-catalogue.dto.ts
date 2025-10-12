import { PartialType } from '@nestjs/swagger';
import { CreateBookCatalogueDto } from './create-book-catalogue.dto';

export class UpdateBookCatalogueDto extends PartialType(CreateBookCatalogueDto) {}
