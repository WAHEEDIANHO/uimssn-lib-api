import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FAQEntity } from "./entities/faq.entity";
import { FAQController } from "./faq.controller";
import { FAQService } from "./faq.service";
import { UtilsModule } from "@uimssn/base_module/utils/utils.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([FAQEntity]),
        UtilsModule
    ],
    controllers: [
        FAQController
    ],
    providers: [
        FAQService
    ]
})
export class FAQModule { }