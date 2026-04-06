import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, Res, HttpStatus, UseGuards, Query, Put } from '@nestjs/common';
import { BookRequestService } from './book-request.service';
import { CreateBookRequestDto } from './dto/create-book-request.dto';
import { UpdateBookRequestDto } from './dto/update-book-request.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BookRequest } from './entities/book-request.entity';
import { BookCatalogue } from '../book-catalogue/entities/book-catalogue.entity';
import { Response } from 'express';
import { Roles } from '@uimssn/base_module/auth/decorator/role.decorator';
import { RoleEnum } from '@uimssn/base_module/user/enums/role.enum';
import { AuthGuard } from '@uimssn/base_module/auth/guard/auth.guard';
import { BookRequestQueryDto } from './dto/book-request-query.dto';
import { ensureEntityExists } from '@uimssn/base_module/utils/entity-exist';
import { SendEmailFromTemplate } from '@uimssn/base_module/email-service/SendEmailFromTemplate';
import { BookCatalogueTypeEnum } from '../book-catalogue/enums/book-catalogue-type.enum';

@ApiTags('Book Request')
@Controller('book-request')
export class BookRequestController {
  private logger = new Logger(BookRequestController.name)
  constructor(private readonly bookRequestService: BookRequestService) { }


  @Post()
  async create(@Body() createBookRequestDto: CreateBookRequestDto, @Res() res: Response): Promise<Response> {
    const bookCatalogue = await this.bookRequestService.isBookExist(createBookRequestDto.bookId);
    if (!bookCatalogue.isAvailable) {
      return res.status(HttpStatus.BAD_REQUEST).json(res.formatResponse(HttpStatus.BAD_REQUEST, "Book is not available", {}));
    }

    if (bookCatalogue.type === BookCatalogueTypeEnum.DIGITAL) {
      return res.status(HttpStatus.BAD_REQUEST).json(res.formatResponse(HttpStatus.BAD_REQUEST, "Digital book cannot be requested", {}));
    }

    const bookRequest = new BookRequest();
    Object.assign(bookRequest, createBookRequestDto);
    bookRequest.book = { id: createBookRequestDto.bookId } as BookCatalogue;
    const result = await this.bookRequestService.create(bookRequest);

    SendEmailFromTemplate({
      template: "book-request",
      to: "waheedianho65@gmail.com",
      locals: {
        bookTitle: bookCatalogue.title,
        bookAuthor: bookCatalogue.author,
        studentName: result.fullName,
        studentId: result.matricNo,
        studentPhone: result.whatsAppNumber,
      },
    })

    return res.status(HttpStatus.CREATED).json(res.formatResponse(HttpStatus.CREATED, "Book request created successfully", result));
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() query: BookRequestQueryDto, @Res() res: Response): Promise<Response> {
    const result = await this.bookRequestService.findAll(query);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Book requests fetched successfully", result));
  }


  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const bookRequest = await this.bookRequestService.findById(id, ['book']);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Book request fetched successfully", bookRequest));
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookRequestDto: UpdateBookRequestDto, @Res() res: Response): Promise<Response> {
    const bookRequest = await this.bookRequestService.findById(id);
    if (!bookRequest) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "Book request not found", {}));
    }
    Object.assign(bookRequest, updateBookRequestDto);
    const updatedBookRequest = await this.bookRequestService.update(bookRequest);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Book request updated successfully", updatedBookRequest));
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const bookRequest = await this.bookRequestService.findById(id);
    if (!bookRequest) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "Book request not found", {}));
    }
    await this.bookRequestService.delete(id);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Book request deleted successfully", {}));
  }
}
