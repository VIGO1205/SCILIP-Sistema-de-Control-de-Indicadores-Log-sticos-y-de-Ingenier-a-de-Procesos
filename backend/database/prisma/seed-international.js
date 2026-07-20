const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedInternational() {
  const company = await prisma.company.findFirst({ where: { taxId: 'DEMO-900123456' } });
  if (!company) {
    console.log('Company not found');
    return;
  }

  const suppliers = await prisma.supplier.findMany({ where: { companyId: company.id } });
  const products = await prisma.product.findMany({ where: { companyId: company.id } });

  if (suppliers.length === 0 || products.length === 0) {
    console.log('Need suppliers and products first');
    return;
  }

  // Clear existing
  await prisma.importExportRecord.deleteMany({ where: { companyId: company.id } });

  const currentYear = new Date().getFullYear();
  const records = [
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

  for (const record of records) {
    const totalCost =
      (record.quantity * record.unitCostUsd) +
      (record.freightCostUsd || 0) +
      (record.insuranceCostUsd || 0) +
      (record.customsDutiesUsd || 0);

    await prisma.importExportRecord.create({
      data: {
        companyId: company.id,
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

  console.log(`Created ${records.length} import/export records`);
}

seedInternational()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
