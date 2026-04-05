import { IGeneralService } from "@uimssn/base_module/utils/abstract/service/i-general.service";
import { BookRequest } from "../entities/book-request.entity";
import { BookCatalogue } from "@uimssn/modules/book-catalogue/entities/book-catalogue.entity";


export interface IBookRequestInterface extends IGeneralService<BookRequest> {
    isBookExist(id: string): Promise<BookCatalogue>;
}