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
} from '@nestjs/common';
import { BookCatalogueService } from '../services/book-catalogue.service';
import { CreateBookCatalogueDto } from '../dto/create-book-catalogue.dto';
import { UpdateBookCatalogueDto } from '../dto/update-book-catalogue.dto';
import { Request, Response } from 'express';
import { BookCatalogue } from '../entities/book-catalogue.entity';
import { PaginationQueryDto } from '../../../built-in/utils/dto/pagination-query.dto';
import { AuthGuard } from '../../../built-in/auth/guard/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('book-catalogue')
export class BookCatalogueController {

  private logger = new Logger(BookCatalogueController.name);
  constructor(private readonly bookCatalogueService: BookCatalogueService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createBookCatalogueDto: CreateBookCatalogueDto, @Res() res: Response): Promise<Response>
  {
      const book = new BookCatalogue();
      Object.assign(book, createBookCatalogueDto);
      const bookCatalogue = await this.bookCatalogueService.create(book);
      return res.status(HttpStatus.CREATED).json(res.formatResponse(HttpStatus.CREATED, "Book created successfully", bookCatalogue));
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto<BookCatalogue>, @Res() res: Response): Promise<Response> {
    const data = await this.bookCatalogueService.findAll(query);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Books fetched successfully", data));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const book = await this.bookCatalogueService.findById(id);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Book fetched successfully", book));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
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
}
