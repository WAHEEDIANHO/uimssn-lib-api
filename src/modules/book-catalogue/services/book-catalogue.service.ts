import { Injectable } from '@nestjs/common';
import { CreateBookCatalogueDto } from '../dto/create-book-catalogue.dto';
import { UpdateBookCatalogueDto } from '../dto/update-book-catalogue.dto';
import { BookCatalogue } from '../entities/book-catalogue.entity';
import { IBookCatalogueService } from './i-service/i-book-catalogue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralService } from '@uimssn/base_module/utils/abstract/service/general.service';

@Injectable()
export class BookCatalogueService extends GeneralService<BookCatalogue> implements IBookCatalogueService{

  constructor(@InjectRepository(BookCatalogue) private readonly bookCatalogueRepository: Repository<BookCatalogue>) {
    super(bookCatalogueRepository);
  }

}
