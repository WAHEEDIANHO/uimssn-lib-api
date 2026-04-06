import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookRequestDto } from './dto/create-book-request.dto';
import { UpdateBookRequestDto } from './dto/update-book-request.dto';
import { GeneralService } from '@uimssn/base_module/utils/abstract/service/general.service';
import { BookRequest } from './entities/book-request.entity';
import { IBookRequestInterface } from './interface/book-request-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCatalogue } from '../book-catalogue/entities/book-catalogue.entity';

@Injectable()
export class BookRequestService extends GeneralService<BookRequest> implements IBookRequestInterface {
  constructor(
    @InjectRepository(BookRequest)
    private readonly bookRequestRepository: Repository<BookRequest>,
  ) {
    super(bookRequestRepository)
  }

  async isBookExist(id: string): Promise<BookCatalogue> {
    const book = await this.bookRequestRepository.manager.getRepository(BookCatalogue).findOneBy({ id })
    if (!book) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }
    return book;
  }

}
