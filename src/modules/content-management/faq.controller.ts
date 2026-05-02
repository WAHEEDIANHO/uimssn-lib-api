import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@uimssn/base_module/auth/guard/auth.guard";
import { FAQService } from "./faq.service";
import { CreateFAQDto } from "./dto/create-faq.dto";
import { FAQEntity } from "./entities/faq.entity";
import { Response } from "express";
import { QueryFAQDto } from "./dto/query.faq.dto";
import { UpdateFAQDto } from "./dto/update-faq.dto";


@ApiTags('FAQ')
@Controller('faq')
export class FAQController {
    constructor(
        private readonly faqService: FAQService
    ) { }


    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post()
    async create(@Body() createFaqDto: CreateFAQDto, @Res() res: Response): Promise<Response> {
        const faq = new FAQEntity();
        Object.assign(faq, createFaqDto);
        const result = await this.faqService.create(faq);
        return res.status(HttpStatus.CREATED).json(res.formatResponse(HttpStatus.CREATED, "FAQ created successfully", result));
    }

    @Get()
    async findAll(@Res() res: Response, @Query()queryFAQDto: QueryFAQDto): Promise<Response> {
        const result = await this.faqService.findAll(queryFAQDto);
        return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "FAQ fetched successfully", result));
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateFAQDto,
        @Res() res: Response,
    ) {
        const faq = await this.faqService.findById(id);
        if (!faq) {
            return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "faq not found", {}));
        }
        Object.assign(faq, dto);
        const updatedFaq = await this.faqService.update(faq);
        return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "faq updated successfully", updatedFaq));
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response): Promise<Response> {

        const faq = await this.faqService.findById(id);
        if (!faq) {
            return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "faq not found", {}));
        }

        await this.faqService.delete(id);
        return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "FAQ deleted successfully", {}));
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response): Promise<Response> {
        const faq = await this.faqService.findById(id);
        if (!faq) {
            return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "faq not found", {}));
        }
        return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "FAQ fetched successfully", faq));
    }

}