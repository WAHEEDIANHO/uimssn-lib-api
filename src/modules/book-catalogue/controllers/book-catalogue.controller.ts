import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Logger,
  HttpStatus,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@uimssn/base_module/auth/guard/auth.guard';
import { PaginationQueryDto } from '@uimssn/base_module/utils/dto/pagination-query.dto';
import { BookCatalogueService } from '@uimssn/modules/book-catalogue/services/book-catalogue.service';
import { CreateBookCatalogueDto } from '@uimssn/modules/book-catalogue/dto/create-book-catalogue.dto';
import { BookCatalogue } from '@uimssn/modules/book-catalogue/entities/book-catalogue.entity';
import { UpdateBookCatalogueDto } from '@uimssn/modules/book-catalogue/dto/update-book-catalogue.dto';
import { SetLibrarianPickDto } from '../dto/set-librarian-pick.dto';
import { BookCatalogueQueryDto } from '../dto/book-catalogue-query.do';

@Controller('book-catalogue')
export class BookCatalogueController {

  private logger = new Logger(BookCatalogueController.name);
  constructor(private readonly bookCatalogueService: BookCatalogueService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createBookCatalogueDto: CreateBookCatalogueDto, @Res() res: Response): Promise<Response> {
    const book = new BookCatalogue();
    Object.assign(book, createBookCatalogueDto);
    const bookCatalogue = await this.bookCatalogueService.create(book);
    return res.status(HttpStatus.CREATED).json(res.formatResponse(HttpStatus.CREATED, "Book created successfully", bookCatalogue));
  }

  @Get()
  async findAll(@Query() query: BookCatalogueQueryDto, @Res() res: Response): Promise<Response> {
    const data = await this.bookCatalogueService.findAll(query);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Books fetched successfully", data));
  }



  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookCatalogueDto: UpdateBookCatalogueDto,
    @Res() res: Response,
  ) {
    const book = await this.bookCatalogueService.findById(id);
    if (!book) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "Book not found", {}));
    }
    Object.assign(book, updateBookCatalogueDto);
    const updatedBook = await this.bookCatalogueService.update(book);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Book updated successfully", updatedBook));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response): Promise<Response> {

    const book = await this.bookCatalogueService.findById(id);
    if (!book) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "Book not found", {}));
    }

    await this.bookCatalogueService.delete(id);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Book deleted successfully", {}));

  }

  @Get('librarian-picks')
  async findLibrarianPicks(@Res() res: Response): Promise<Response> {
    const books = await this.bookCatalogueService.librarianPick();
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Librarian picks fetched successfully", books));
  }

  @Post('librarian-picks')
  async setLibrarianPicks(@Body() bookCatalogueIds: SetLibrarianPickDto, @Res() res: Response): Promise<Response> {
    await this.bookCatalogueService.setLaberianPick(bookCatalogueIds);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Librarian picks updated successfully", {}));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const book = await this.bookCatalogueService.findById(id);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Book fetched successfully", book));
  }
}
