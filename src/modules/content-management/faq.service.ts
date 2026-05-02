import { Injectable, Scope } from "@nestjs/common";
import { GeneralService } from "@uimssn/base_module/utils/abstract/service/general.service";
import { FAQEntity } from "./entities/faq.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";



@Injectable({scope: Scope.DEFAULT})
export class FAQService extends GeneralService<FAQEntity>{
    constructor(
        @InjectRepository(FAQEntity)
        private readonly faqRepository: Repository<FAQEntity>,
    ) {
        super(faqRepository)
    }
}