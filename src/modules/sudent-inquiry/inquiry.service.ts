import { Injectable } from "@nestjs/common";
import { GeneralService } from "@uimssn/base_module/utils/abstract/service/general.service";
import { InquiryEntity } from "./entities/inquiry.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";




@Injectable()
export class InquiryService extends GeneralService<InquiryEntity> {
    constructor(
        @InjectRepository(InquiryEntity)
        private readonly inquiryRepository: Repository<InquiryEntity>,
    ) {
        super(inquiryRepository)
    }
}