import { Module } from '@nestjs/common';
import { LogsController } from '@uimssn/base_module/logs/logs.controller';
import { LogsService } from '@uimssn/base_module/logs/logs.service';

@Module({
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
