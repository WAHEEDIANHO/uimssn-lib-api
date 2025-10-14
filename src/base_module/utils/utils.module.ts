import { Module } from '@nestjs/common';
import { ExtractToken } from '@uimssn/base_module/utils/extract-token';
import { HashPassword } from '@uimssn/base_module/utils/hash-password';

@Module({
  providers: [ExtractToken, HashPassword, ExtractToken, HashPassword],
  exports: [ExtractToken, HashPassword, ExtractToken, HashPassword]
})
export class UtilsModule {}