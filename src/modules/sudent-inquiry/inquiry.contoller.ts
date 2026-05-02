import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { InquiryService } from "./inquiry.service";
import { CreateInquiryDto } from "./dto/create-inquiry.dto";
import { InquiryEntity } from "./entities/inquiry.entity";
import { Response } from "express";
import { BookCatalogueQueryDto } from "../book-catalogue/dto/book-catalogue-query.do";
import { QueryInquiryDto } from "./dto/query-inquiry.dto";
import { AuthGuard } from "@uimssn/base_module/auth/guard/auth.guard";
import { UpdateInquiryDto } from "./dto/update-inquiry.dto";
import { SendEmailFromTemplate } from "@uimssn/base_module/email-service/SendEmailFromTemplate";
import { ConfigService } from "@nestjs/config";


@ApiTags('inquiry')
@Controller('inquiry')
export class InquiryController {

    constructor(
        private readonly inquiryService: InquiryService,
        private readonly configService: ConfigService,
    ) { }


    @Post('')
    async create(@Body() createInquiryDto: CreateInquiryDto, @Res() res: Response): Promise<Response> {
        const inquiry = new InquiryEntity();
        Object.assign(inquiry, createInquiryDto)
        const result = await this.inquiryService.create(inquiry);

        SendEmailFromTemplate({
            template: 'inquiry',
            to: this.configService.get<string>('APP_MAILER_USER'),
            locals: {
                name: result.fullName,
                email: result?.email,
                phoneNumber: result.phoneNumber,
                message: result.message,
                reason: result.reason,
                department: result.department,
                matricNo: result.matricNo,
                faculty: result.faculty,
            },
        })
        return res.status(HttpStatus.CREATED).json(res.formatResponse(HttpStatus.CREATED, "Inquiry created successfully", result));
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Query() query: QueryInquiryDto, @Res() res: Response): Promise<Response> {
        const data = await this.inquiryService.findAll(query);
        return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "inquiries fetched successfully", data));
    }


    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateInquiryDto,
        @Res() res: Response,
    ) {
        const inquiry = await this.inquiryService.findById(id);
        if (!inquiry) {
            return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "Inquiry not found", {}));
        }
        Object.assign(inquiry, dto);
        const updatedBook = await this.inquiryService.update(inquiry);
        return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Inquiry updated successfully", updatedBook));
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response): Promise<Response> {

        const inquiry = await this.inquiryService.findById(id);
        if (!inquiry) {
            return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "Inquiry not found", {}));
        }

        await this.inquiryService.delete(id);
        return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Inquiry deleted successfully", {}));
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response): Promise<Response> {
        const book = await this.inquiryService.findById(id);
        return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Inquiry fetched successfully", book));
    }

}