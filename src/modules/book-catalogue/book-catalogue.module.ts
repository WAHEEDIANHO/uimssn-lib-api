import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from '@uimssn/base_module/utils/utils.module';
import { BookCatalogue } from '@uimssn/modules/book-catalogue/entities/book-catalogue.entity';
import { BookCatalogueController } from '@uimssn/modules/book-catalogue/controllers/book-catalogue.controller';
import { BookCatalogueService } from '@uimssn/modules/book-catalogue/services/book-catalogue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookCatalogue]),
    UtilsModule
  ],
  controllers: [BookCatalogueController],
  providers: [BookCatalogueService],
})
export class BookCatalogueModule {}
