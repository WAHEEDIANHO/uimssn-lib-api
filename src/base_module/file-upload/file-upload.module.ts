import { Module } from '@nestjs/common';
import { FileUploadService } from '@uimssn/base_module/file-upload/file-upload.service';
import { FileUploadController } from '@uimssn/base_module/file-upload/file-upload.controller';

@Module({
  providers: [FileUploadService],
  controllers: [FileUploadController]
})
export class FileUploadModule {}