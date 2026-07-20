import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  KPI_CATEGORIES,
  KPI_DEFINITIONS,
} from './seed-kpi-data';

const prisma = new PrismaClient();

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function computeStatus(actual: number, target: number, direction: 'up' | 'down'): string {
  const deviation = direction === 'up'
    ? ((target - actual) / target) * 100
    : ((actual - target) / target) * 100;
  if (deviation <= 5) return 'good';
  if (deviation <= 15) return 'warning';
  return 'bad';
}

async function seedKpiCatalog(companyId: string) {
  const categoryIdByCode = new Map<string, number>();

  for (const cat of KPI_CATEGORIES) {
    const category = await prisma.kpiCategory.upsert({
      where: { code: cat.code },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
      create: {
        code: cat.code,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
    });
    categoryIdByCode.set(cat.code, category.id);
  }

  const kpiIdByCode = new Map<string, number>();

  for (const kpi of KPI_DEFINITIONS) {
    const categoryId = categoryIdByCode.get(kpi.categoryCode);
    if (!categoryId) continue;

    const definition = await prisma.kpiDefinition.upsert({
      where: { code: kpi.code },
      update: {
        categoryId,
        name: kpi.name,
        description: kpi.description,
        objective: kpi.description,
        formula: kpi.formula,
        unit: kpi.unit,
        unitType: kpi.unitType,
        indicatorClass: kpi.indicatorClass,
        direction: kpi.direction,
        targetValue: kpi.targetValue,
        responsibleRole: kpi.responsibleRole,
        dataSource: `chart:${kpi.chartType}`,
        periodicity: 'monthly',
        isActive: true,
      },
      create: {
        code: kpi.code,
        categoryId,
        name: kpi.name,
        description: kpi.description,
        objective: kpi.description,
        formula: kpi.formula,
        unit: kpi.unit,
        unitType: kpi.unitType,
        indicatorClass: kpi.indicatorClass,
        direction: kpi.direction,
        targetValue: kpi.targetValue,
        responsibleRole: kpi.responsibleRole,
        dataSource: `chart:${kpi.chartType}`,
        periodicity: 'monthly',
        isActive: true,
      },
    });
    kpiIdByCode.set(kpi.code, definition.id);
  }

  const currentYear = new Date().getFullYear();
  let valuesCreated = 0;

  for (const kpi of KPI_DEFINITIONS) {
    const kpiId = kpiIdByCode.get(kpi.code);
    if (!kpiId) continue;

    for (let month = 0; month < 12; month++) {
      const target = Number(kpi.targetValue);
      const factor = 0.85 + Math.random() * 0.3;
      const actual = Math.round(target * factor * 100) / 100;
      
      const varianceAbsolute = Math.round((actual - target) * 100) / 100;
      const variancePercentage = Math.round((varianceAbsolute / target) * 10000) / 100;

      await prisma.kpiValue.create({
        data: {
          kpiId,
          companyId,
          periodDate: new Date(Date.UTC(currentYear, month, 1)),
          actualValue: actual,
          targetValue: target,
          varianceAbsolute,
          variancePercentage,
          status: computeStatus(actual, target, kpi.direction as 'up' | 'down'),
          dataSourceMetadata: { source: 'seed', monthLabel: MONTH_LABELS[month] },
        },
      });
      valuesCreated++;
    }
  }

  return { valuesCreated };
}

async function seedBusinessData(companyId: string) {
  // 1. Proveedores
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { code: 'SUP-001', name: 'Logistics Pro Global', contactPerson: 'John Doe', email: 'john@logpro.com', phone: '12345', address: 'Calle 95 #10-20, Bogotá', companyId } }),
    prisma.supplier.create({ data: { code: 'SUP-002', name: 'Empaques de Colombia', contactPerson: 'Maria G.', email: 'maria@empaques.co', phone: '67890', address: 'Avenida 68 #24-35, Bogotá', companyId } }),
  ]);

  // 2. Productos
  const products = await Promise.all([
    prisma.product.create({ data: { sku: 'SKU-001', name: 'Pallet Madera Estándar', category: 'Almacenamiento', unitOfMeasure: 'und', minStock: 200, companyId } }),
    prisma.product.create({ data: { sku: 'SKU-002', name: 'Cinta de Embalaje 50mm', category: 'Consumibles', unitOfMeasure: 'rollo', minStock: 100, companyId } }),
  ]);

  // 3. Bodegas
  const warehouse = await prisma.warehouse.create({
    data: { name: 'CEDI Principal Bogotá', code: 'CEDI-BOG', address: 'Calle 80 #12-34', city: 'Bogotá', totalAreaM2: 2500, companyId }
  });

  // 4. Vehículos
  const vehicle = await prisma.vehicle.create({
    data: { plateNumber: 'TRK-123', brand: 'Kenworth', model: 'T800', vehicleType: 'Tractomula', maxWeightKg: 35000, status: 'AVAILABLE', companyId }
  });

  // 5. Ventas (Clientes implícitos)
  const sale = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      customerName: 'Tiendas Éxito S.A.',
      customerDocument: '900.123.456-1',
      saleDate: new Date(),
      totalAmount: 15000000,
      grossProfit: 3000000,
      companyId,
      lines: {
        create: {
          productId: products[0].id,
          quantity: 100,
          unitPrice: 150000,
          totalPrice: 15000000
        }
      }
    }
  });

  // 6. Algunos movimientos de ejemplo
  await prisma.inventoryMovement.create({
    data: { 
      productId: products[0].id, 
      warehouseId: warehouse.id, 
      movementType: 'IN', 
      quantity: 500, 
      companyId, 
      movementDate: new Date(),
      notes: 'Carga inicial' 
    }
  });

  // 7. Importaciones y Exportaciones de ejemplo
  const currentYear = new Date().getFullYear();
  const importExportRecords = [
    // Importaciones
    {
      operationType: 'IMPORT',
      productId: products[0].id,
      supplierId: suppliers[0].id,
      operationDate: new Date(currentYear, 0, 15),
      quantity: 200,
      unitCostUsd: 45.50,
      freightCostUsd: 1200,
      insuranceCostUsd: 350,
      customsDutiesUsd: 890,
      portOfOrigin: 'Shanghai, China',
      portOfDestination: 'Buenaventura, Colombia',
      containerNumber: 'MSCU1234567',
      blNumber: 'BL-2024-001',
      status: 'DELIVERED',
    },
    {
      operationType: 'IMPORT',
      productId: products[1].id,
      supplierId: suppliers[1].id,
      operationDate: new Date(currentYear, 1, 10),
      quantity: 500,
      unitCostUsd: 12.30,
      freightCostUsd: 850,
      insuranceCostUsd: 180,
      customsDutiesUsd: 420,
      portOfOrigin: 'Shenzhen, China',
      portOfDestination: 'Cartagena, Colombia',
      containerNumber: 'APLU7654321',
      blNumber: 'BL-2024-002',
      status: 'DELIVERED',
    },
    {
      operationType: 'IMPORT',
      productId: products[0].id,
      supplierId: suppliers[0].id,
      operationDate: new Date(currentYear, 2, 5),
      quantity: 300,
      unitCostUsd: 48.00,
      freightCostUsd: 1350,
      insuranceCostUsd: 400,
      customsDutiesUsd: 950,
      portOfOrigin: 'Rotterdam, Países Bajos',
      portOfDestination: 'Buenaventura, Colombia',
      containerNumber: 'HLCU9876543',
      blNumber: 'BL-2024-003',
      status: 'CUSTOMS',
    },
    {
      operationType: 'IMPORT',
      productId: products[1].id,
      supplierId: suppliers[1].id,
      operationDate: new Date(currentYear, 3, 20),
      quantity: 400,
      unitCostUsd: 11.80,
      freightCostUsd: 920,
      insuranceCostUsd: 200,
      customsDutiesUsd: 380,
      portOfOrigin: 'Valencia, España',
      portOfDestination: 'Cartagena, Colombia',
      containerNumber: 'CMAU4567890',
      blNumber: 'BL-2024-004',
      status: 'IN_TRANSIT',
    },
    {
      operationType: 'IMPORT',
      productId: products[0].id,
      supplierId: suppliers[0].id,
      operationDate: new Date(currentYear, 4, 8),
      quantity: 150,
      unitCostUsd: 46.20,
      freightCostUsd: 1100,
      insuranceCostUsd: 320,
      customsDutiesUsd: 780,
      portOfOrigin: 'Hamburgo, Alemania',
      portOfDestination: 'Buenaventura, Colombia',
      containerNumber: 'MAEU1122334',
      blNumber: 'BL-2024-005',
      status: 'PORT_OF_ORIGIN',
    },
    // Exportaciones
    {
      operationType: 'EXPORT',
      productId: products[0].id,
      customerName: 'Global Trade Inc.',
      operationDate: new Date(currentYear, 0, 22),
      quantity: 120,
      unitCostUsd: 52.00,
      freightCostUsd: 950,
      insuranceCostUsd: 280,
      customsDutiesUsd: 600,
      portOfOrigin: 'Cartagena, Colombia',
      portOfDestination: 'Miami, USA',
      containerNumber: 'MSCU7654321',
      blNumber: 'BL-EXP-2024-001',
      status: 'DELIVERED',
    },
    {
      operationType: 'EXPORT',
      productId: products[1].id,
      customerName: 'EuroPack GmbH',
      operationDate: new Date(currentYear, 1, 14),
      quantity: 250,
      unitCostUsd: 14.50,
      freightCostUsd: 780,
      insuranceCostUsd: 150,
      customsDutiesUsd: 310,
      portOfOrigin: 'Buenaventura, Colombia',
      portOfDestination: 'Hamburgo, Alemania',
      containerNumber: 'APLU3344556',
      blNumber: 'BL-EXP-2024-002',
      status: 'DELIVERED',
    },
    {
      operationType: 'EXPORT',
      productId: products[0].id,
      customerName: 'Latam Logistics S.A.',
      operationDate: new Date(currentYear, 2, 28),
      quantity: 180,
      unitCostUsd: 50.50,
      freightCostUsd: 1050,
      insuranceCostUsd: 290,
      customsDutiesUsd: 550,
      portOfOrigin: 'Cartagena, Colombia',
      portOfDestination: 'Santos, Brasil',
      containerNumber: 'HLCU7788990',
      blNumber: 'BL-EXP-2024-003',
      status: 'CUSTOMS',
    },
    {
      operationType: 'EXPORT',
      productId: products[1].id,
      customerName: 'Asia Pacific Co.',
      operationDate: new Date(currentYear, 3, 5),
      quantity: 350,
      unitCostUsd: 13.20,
      freightCostUsd: 880,
      insuranceCostUsd: 190,
      customsDutiesUsd: 400,
      portOfOrigin: 'Buenaventura, Colombia',
      portOfDestination: 'Shanghai, China',
      containerNumber: 'CMAU9988776',
      blNumber: 'BL-EXP-2024-004',
      status: 'IN_TRANSIT',
    },
    {
      operationType: 'EXPORT',
      productId: products[0].id,
      customerName: 'North America Supply LLC',
      operationDate: new Date(currentYear, 4, 12),
      quantity: 200,
      unitCostUsd: 53.00,
      freightCostUsd: 1150,
      insuranceCostUsd: 310,
      customsDutiesUsd: 670,
      portOfOrigin: 'Cartagena, Colombia',
      portOfDestination: 'Veracruz, México',
      containerNumber: 'MAEU5566778',
      blNumber: 'BL-EXP-2024-005',
      status: 'PORT_OF_ORIGIN',
    },
  ];

  for (const record of importExportRecords) {
    const totalCost = 
      (record.quantity * record.unitCostUsd) +
      (record.freightCostUsd || 0) +
      (record.insuranceCostUsd || 0) +
      (record.customsDutiesUsd || 0);

    await prisma.importExportRecord.create({
      data: {
        companyId,
        operationType: record.operationType,
        productId: record.productId,
        supplierId: record.supplierId || null,
        customerName: record.customerName || null,
        operationDate: record.operationDate,
        quantity: record.quantity,
        unitCostUsd: record.unitCostUsd,
        totalCostUsd: totalCost,
        freightCostUsd: record.freightCostUsd || null,
        insuranceCostUsd: record.insuranceCostUsd || null,
        customsDutiesUsd: record.customsDutiesUsd || null,
        portOfOrigin: record.portOfOrigin || null,
        portOfDestination: record.portOfDestination || null,
        containerNumber: record.containerNumber || null,
        blNumber: record.blNumber || null,
        status: record.status || null,
      },
    });
  }

  return { suppliers, products, warehouse, vehicle, sale };
}

async function main() {
  const passwordHash = await bcrypt.hash('demo123', 10);

  console.log('Limpiando base de datos...');
  await prisma.kpiValue.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.importExportRecord.deleteMany();
  await prisma.dispatch.deleteMany();
  await prisma.saleLine.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.employee.deleteMany();

  const company = await prisma.company.upsert({
    where: { taxId: 'DEMO-900123456' },
    update: {},
    create: {
      taxId: 'DEMO-900123456',
      legalName: 'Empresa Demo Cadena de Suministros S.A.S',
      tradeName: 'Demo Logistics',
      country: 'Colombia',
      city: 'Bogotá',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      permissions: { modules: ['*'], companyId: company.id },
    },
    create: {
      name: 'ADMIN',
      description: 'Administrador del sistema',
      permissions: { modules: ['*'], companyId: company.id },
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: { passwordHash, roleId: adminRole.id },
    create: {
      email: 'admin@demo.local',
      passwordHash,
      fullName: 'Administrador Demo',
      roleId: adminRole.id,
    },
  });

  console.log('Sembrando catálogo de KPIs y series históricas...');
  const kpiStats = await seedKpiCatalog(company.id);

  console.log('Sembrando datos de negocio (Proveedores, Productos, Bodegas)...');
  await seedBusinessData(company.id);

  console.log('Seed Completo Finalizado con Éxito');
  console.log(`- Registros de KPI creados: ${kpiStats.valuesCreated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
