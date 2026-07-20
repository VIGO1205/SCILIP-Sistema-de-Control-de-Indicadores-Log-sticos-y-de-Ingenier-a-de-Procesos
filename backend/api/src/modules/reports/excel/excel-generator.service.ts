import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  style?: Partial<ExcelJS.Style>;
}

export interface ExcelReportData {
  title: string;
  subtitle?: string;
  companyName?: string;
  generatedBy?: string;
  generatedAt?: string;
  sheetName: string;
  columns: ExcelColumn[];
  rows: any[];
  summary?: { label: string; value: string | number }[];
}

@Injectable()
export class ExcelGeneratorService {
  private readonly logger = new Logger(ExcelGeneratorService.name);

  async generateReport(data: ExcelReportData): Promise<Buffer> {
    this.logger.log(`Generating Excel report: ${data.title}`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(data.sheetName, {
      properties: { defaultRowHeight: 20 },
    });

    // ── HEADER / CABECERA ──
    const headerRow = worksheet.addRow([data.companyName || 'SCILIP Logistics']);
    headerRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // primary color
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('A1', `${this.colLetter(data.columns.length)}1`);

    const titleRow = worksheet.addRow([data.title]);
    titleRow.font = { bold: true, size: 14, color: { argb: 'FF111827' } };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('A2', `${this.colLetter(data.columns.length)}2`);

    if (data.subtitle) {
      const subRow = worksheet.addRow([data.subtitle]);
      subRow.font = { size: 11, color: { argb: 'FF6B7280' }, italic: true };
      subRow.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells('A3', `${this.colLetter(data.columns.length)}3`);
    }

    const metaRow = worksheet.addRow([
      `Generado por: ${data.generatedBy || 'Sistema SCILIP'} | Fecha: ${data.generatedAt || new Date().toLocaleString('es-CO')}`,
    ]);
    metaRow.font = { size: 9, color: { argb: 'FF9CA3AF' } };
    metaRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(`A${metaRow.number}`, `${this.colLetter(data.columns.length)}${metaRow.number}`);

    // Blank row
    worksheet.addRow([]);

    // ── TABLE HEADER ──
    const tableHeaderRow = worksheet.addRow(data.columns.map((c) => c.header));
    tableHeaderRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    tableHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } }; // dark gray
    tableHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    tableHeaderRow.border = {
      bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
    };

    // ── DATA ROWS ──
    data.rows.forEach((row, idx) => {
      const values = data.columns.map((col) => row[col.key] ?? '');
      const excelRow = worksheet.addRow(values);
      excelRow.alignment = { vertical: 'middle' };

      // Alternate row colors
      if (idx % 2 === 0) {
        excelRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }

      // Number alignment for numeric columns
      data.columns.forEach((col, colIdx) => {
        const cell = excelRow.getCell(colIdx + 1);
        if (typeof row[col.key] === 'number') {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });

      // Borders
      excelRow.border = {
        top: { style: 'hair', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      };
    });

    // ── COLUMN WIDTHS ──
    data.columns.forEach((col, idx) => {
      worksheet.getColumn(idx + 1).width = col.width || 18;
    });

    // ── SUMMARY SECTION ──
    if (data.summary && data.summary.length > 0) {
      worksheet.addRow([]);
      const summaryLabelRow = worksheet.addRow(['RESUMEN']);
      summaryLabelRow.font = { bold: true, size: 12, color: { argb: 'FF111827' } };
      summaryLabelRow.alignment = { horizontal: 'left', vertical: 'middle' };
      worksheet.mergeCells(`A${summaryLabelRow.number}`, `${this.colLetter(data.columns.length)}${summaryLabelRow.number}`);

      data.summary.forEach((item) => {
        const sRow = worksheet.addRow([item.label, item.value]);
        sRow.font = { size: 10 };
        sRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF374151' } };
        sRow.getCell(2).font = { size: 10, color: { argb: 'FF4F46E5' } };
        sRow.alignment = { vertical: 'middle' };
      });
    }

    // ── FOOTER ──
    worksheet.addRow([]);
    const footerRow = worksheet.addRow(['Documento generado por SCILIP BI Logístico - ProyectoCD']);
    footerRow.font = { size: 8, color: { argb: 'FF9CA3AF' }, italic: true };
    footerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(`A${footerRow.number}`, `${this.colLetter(data.columns.length)}${footerRow.number}`);

    // Freeze panes
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 6 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private colLetter(n: number): string {
    let result = '';
    while (n > 0) {
      n--;
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result || 'A';
  }
}
