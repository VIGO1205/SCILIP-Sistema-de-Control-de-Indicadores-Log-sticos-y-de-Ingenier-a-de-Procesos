import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface SupplierCertificationResult {
  certificationPercentage: number;
  certifiedSuppliers: number;
  totalSuppliers: number;
}

@Injectable()
export class SupplierCertificationCalculator {
  private readonly logger = new Logger(SupplierCertificationCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el indicador de Certificación de Proveedores
   * Fórmula: (Proveedores Certificados / Total Proveedores) * 100
   */
  async calculate(companyId: string): Promise<SupplierCertificationResult> {
    this.logger.log(`Calculating Supplier Certification for company ${companyId}`);

    const totalSuppliers = await this.prisma.supplier.count({
      where: { companyId, status: 'active' },
    });

    const certifiedSuppliers = await this.prisma.supplier.count({
      where: { 
        companyId, 
        status: 'active',
        isCertified: true 
      },
    });

    const certificationPercentage = totalSuppliers > 0 
      ? (certifiedSuppliers / totalSuppliers) * 100 
      : 0;

    return {
      certificationPercentage: Number(certificationPercentage.toFixed(2)),
      certifiedSuppliers,
      totalSuppliers,
    };
  }
}
