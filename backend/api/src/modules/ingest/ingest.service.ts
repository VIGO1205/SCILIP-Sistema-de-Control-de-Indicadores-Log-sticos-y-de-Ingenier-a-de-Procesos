import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CsvParserService } from './processors/csv-parser.service';
import { PurchaseOrderCsvSchema } from './dto/purchase-order.schema';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csvParser: CsvParserService,
  ) {}

  async processPurchaseOrders(companyId: string, userId: string, fileBuffer: Buffer) {
    this.logger.log(`Processing purchase orders CSV for company ${companyId}`);
    
    // 1. Parse CSV
    const parsedData = await this.csvParser.parseCsv<any>(fileBuffer);
    
    const errors = [];
    const validRecords = [];

    // 2. Validate and Clean
    parsedData.forEach((row, index) => {
      const result = PurchaseOrderCsvSchema.safeParse(row);
      if (!result.success) {
        errors.push({
          row: index + 2, // Excel row number (1-based + 1 for header)
          issues: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      } else {
        validRecords.push(result.data);
      }
    });

    if (validRecords.length === 0) {
      throw new BadRequestException({ message: 'No valid records found in CSV', errors });
    }

    // 3. Database Insertion (in a transaction)
    let insertedCount = 0;
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const record of validRecords) {
          await tx.purchaseOrder.upsert({
            where: {
              companyId_poNumber: {
                companyId: companyId,
                poNumber: record.po_number,
              }
            },
            update: {
              orderDate: new Date(record.order_date),
              expectedDeliveryDate: record.expected_delivery_date ? new Date(record.expected_delivery_date) : null,
              actualDeliveryDate: record.actual_delivery_date ? new Date(record.actual_delivery_date) : null,
              subtotal: record.subtotal,
              tax: record.tax,
              totalAmount: record.total_amount,
              currency: record.currency,
              status: record.status,
              rejectionReason: record.rejection_reason,
              notes: record.notes,
              updatedAt: new Date(),
            },
            create: {
              companyId: companyId,
              poNumber: record.po_number,
              supplierId: record.supplier_id,
              warehouseId: record.warehouse_id || null,
              orderDate: new Date(record.order_date),
              expectedDeliveryDate: record.expected_delivery_date ? new Date(record.expected_delivery_date) : null,
              actualDeliveryDate: record.actual_delivery_date ? new Date(record.actual_delivery_date) : null,
              subtotal: record.subtotal,
              tax: record.tax,
              totalAmount: record.total_amount,
              currency: record.currency,
              status: record.status,
              rejectionReason: record.rejection_reason,
              notes: record.notes,
              createdBy: userId,
            }
          });
          insertedCount++;
        }

        // 4. Audit Log
        await tx.auditLog.create({
          data: {
            userId: userId,
            action: 'INGEST_CSV',
            entityType: 'PurchaseOrder',
            newValues: { count: insertedCount, validRecords: validRecords.length, errors: errors.length },
          }
        });
      });
    } catch (e) {
      this.logger.error('Failed to insert records', e);
      throw new BadRequestException('Database insertion failed. Ensure supplier_id and warehouse_id exist.');
    }

    return {
      success: true,
      processed: validRecords.length,
      insertedOrUpdated: insertedCount,
      errorsCount: errors.length,
      errors: errors.slice(0, 50), // Return max 50 errors
    };
  }

  // To be implemented later by teammates
  async processSales(sales: any[], source: string) { return {}; }
  async processInventoryMovements(movements: any[], source: string) { return {}; }
}
