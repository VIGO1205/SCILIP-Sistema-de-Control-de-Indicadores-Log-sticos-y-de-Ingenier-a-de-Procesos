import { Injectable, BadRequestException } from '@nestjs/common';
import * as Papa from 'papaparse';

@Injectable()
export class CsvParserService {
  /**
   * Parses a CSV buffer into an array of objects.
   * @param buffer The file buffer containing CSV data
   * @returns An array of parsed objects
   */
  async parseCsv<T>(buffer: Buffer): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const csvString = buffer.toString('utf-8');

      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Standardize headers: lowercase, trim spaces, replace spaces with underscores
          return header.toLowerCase().trim().replace(/\s+/g, '_');
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            // Optional: you can handle or log parsing errors here
            console.warn('CSV Parsing Warnings/Errors:', results.errors);
          }
          resolve(results.data as T[]);
        },
        error: (error: any) => {
          reject(new BadRequestException(`Failed to parse CSV file: ${error.message}`));
        },
      });
    });
  }
}
