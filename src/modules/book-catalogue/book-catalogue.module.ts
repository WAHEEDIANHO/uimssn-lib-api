import { Module } from '@nestjs/common';
import { BookCatalogueService } from './services/book-catalogue.service';
import { BookCatalogueController } from './controllers/book-catalogue.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCatalogue } from './entities/book-catalogue.entity';
import { AuthModule } from '../../built-in/auth/auth.module';
import { UtilsModule } from '../../built-in/utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookCatalogue]),
    UtilsModule
  ],
  controllers: [BookCatalogueController],
  providers: [BookCatalogueService],
})
export class BookCatalogueModule {}
