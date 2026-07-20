import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { ExcelGeneratorService } from './excel/excel-generator.service';
import { TransportModule } from '../transport/transport.module';

@Module({
  imports: [TransportModule],
  controllers: [ReportsController],
  providers: [ReportsService, PdfGeneratorService, ExcelGeneratorService],
  exports: [ReportsService],
})
export class ReportsModule {}
