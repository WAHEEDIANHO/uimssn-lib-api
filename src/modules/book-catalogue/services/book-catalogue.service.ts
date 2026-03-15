import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralService } from '@uimssn/base_module/utils/abstract/service/general.service';
import { BookCatalogue } from '@uimssn/modules/book-catalogue/entities/book-catalogue.entity';
import { IBookCatalogueService } from '@uimssn/modules/book-catalogue/services/i-service/i-book-catalogue.service';
import { SetLibrarianPickDto } from '../dto/set-librarian-pick.dto';

@Injectable()
export class BookCatalogueService extends GeneralService<BookCatalogue> implements IBookCatalogueService{

  constructor(@InjectRepository(BookCatalogue) private readonly bookCatalogueRepository: Repository<BookCatalogue>) {
    super(bookCatalogueRepository);
  }

  async librarianPick(): Promise<BookCatalogue[]> {
    return await this.bookCatalogueRepository.find({ where: { isLibrarianPick: true } });
  }

  async setLaberianPick(dto: SetLibrarianPickDto): Promise<void> {
    await this.bookCatalogueRepository.update({ isLibrarianPick: true }, { isLibrarianPick: false });
    await this.bookCatalogueRepository.createQueryBuilder()
      .update(BookCatalogue)
      .set({ isLibrarianPick: true })
      .where("id IN (:...ids)", { ids: dto.bookId })
      .execute();
  }
}
