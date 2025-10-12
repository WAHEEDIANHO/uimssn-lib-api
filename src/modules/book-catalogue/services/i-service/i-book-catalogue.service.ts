import { IGeneralService } from '../../../../built-in/utils/abstract/service/i-general.service';
import { BookCatalogue } from '../../entities/book-catalogue.entity';

export interface IBookCatalogueService extends  IGeneralService<BookCatalogue>
{}