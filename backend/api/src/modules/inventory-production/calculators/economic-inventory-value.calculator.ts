import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface EconomicInventoryValueResult {
	economicInventoryValue: number;
	totalUnits: number;
	message?: string;
}

@Injectable()
export class EconomicInventoryValueCalculator {
	private readonly logger = new Logger(EconomicInventoryValueCalculator.name);

	constructor(private readonly prisma: PrismaService) {}

	async calculate(companyId: string, endDate: Date): Promise<EconomicInventoryValueResult> {
		this.logger.log(`Calculating Economic Inventory Value for company ${companyId} up to ${endDate.toISOString()}`);

		const records = await this.prisma.physicalInventory.findMany({
			where: {
				companyId,
				inventoryDate: {
					lte: endDate,
				},
			},
			include: {
				product: true,
			},
		});

		let totalUnits = 0;
		let economicInventoryValue = 0;

		for (const record of records) {
			const units = Number(record.theoreticalQuantity || 0);
			const unitCost = Number(record.product?.unitCost || 0);

			totalUnits += units;
			economicInventoryValue += units * unitCost;
		}

		if (economicInventoryValue === 0) {
			return {
				economicInventoryValue: 0,
				totalUnits: 0,
				message: 'No se encontraron datos de inventario para el período seleccionado.',
			};
		}

		return {
			economicInventoryValue: Number(economicInventoryValue.toFixed(2)),
			totalUnits,
		};
	}
}
