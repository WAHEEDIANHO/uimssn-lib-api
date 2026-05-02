import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InquiryEntity } from "./entities/inquiry.entity";
import { InquiryService } from "./inquiry.service";
import { InquiryController } from "./inquiry.contoller";
import { UtilsModule } from "@uimssn/base_module/utils/utils.module";


@Module({
    imports: [TypeOrmModule.forFeature([InquiryEntity]), UtilsModule],
    providers: [InquiryService],
    controllers: [InquiryController],
    exports: [InquiryService],
})
export class InquiryModule {}