import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestController } from './ingest.controller';
import { CsvParserService } from './processors/csv-parser.service';

@Module({
  controllers: [IngestController],
  providers: [IngestService, CsvParserService],
  exports: [IngestService],
})
export class IngestModule {}
