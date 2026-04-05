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

@ApiTags('Book Request')
@Controller('book-request')
export class BookRequestController {
  private logger = new Logger(BookRequestController.name)
  constructor(private readonly bookRequestService: BookRequestService) { }


  @Post()
  async create(@Body() createBookRequestDto: CreateBookRequestDto, @Res() res: Response): Promise<Response> {
    await this.bookRequestService.isBookExist(createBookRequestDto.bookId);
    const bookRequest = new BookRequest();
    Object.assign(bookRequest, createBookRequestDto);
    bookRequest.book = { id: createBookRequestDto.bookId } as BookCatalogue;
    return res.status(HttpStatus.CREATED).json(res.formatResponse(HttpStatus.CREATED, "Book request created successfully", await this.bookRequestService.create(bookRequest)));
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
