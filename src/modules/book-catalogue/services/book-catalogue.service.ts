import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralService } from '@uimssn/base_module/utils/abstract/service/general.service';
import { BookCatalogue } from '@uimssn/modules/book-catalogue/entities/book-catalogue.entity';
import { IBookCatalogueService } from '@uimssn/modules/book-catalogue/services/i-service/i-book-catalogue.service';

@Injectable()
export class BookCatalogueService extends GeneralService<BookCatalogue> implements IBookCatalogueService{

  constructor(@InjectRepository(BookCatalogue) private readonly bookCatalogueRepository: Repository<BookCatalogue>) {
    super(bookCatalogueRepository);
  }

}
