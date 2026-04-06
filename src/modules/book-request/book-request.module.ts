import { Module } from '@nestjs/common';
import { BookRequestService } from './book-request.service';
import { BookRequestController } from './book-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookRequest } from './entities/book-request.entity';
import { UtilsModule } from '@uimssn/base_module/utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([BookRequest]), UtilsModule],
  controllers: [BookRequestController],
  providers: [BookRequestService],
})
export class BookRequestModule { }
  