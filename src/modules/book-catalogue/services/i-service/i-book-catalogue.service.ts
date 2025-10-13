import { IGeneralService } from '@uimssn/base_module/utils/abstract/service/i-general.service';
import { BookCatalogue } from '@uimssn/modules/book-catalogue/entities/book-catalogue.entity';

export interface IBookCatalogueService extends  IGeneralService<BookCatalogue>
{}