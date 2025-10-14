import { PartialType } from '@nestjs/swagger';
import { CreateBookCatalogueDto } from '@uimssn/modules/book-catalogue/dto/create-book-catalogue.dto';

export class UpdateBookCatalogueDto extends PartialType(CreateBookCatalogueDto) {}
