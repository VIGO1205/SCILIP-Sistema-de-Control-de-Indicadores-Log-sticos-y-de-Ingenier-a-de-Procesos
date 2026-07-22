import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { KPI_CATEGORIES, KPI_DEFINITIONS } from './seed-kpi-data';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rnd(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function monthStart(monthsBack: number): Date {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsBack);
  return d;
}

function computeStatus(actual: number, target: number, direction: string): string {
  const deviation = direction === 'up'
    ? ((target - actual) / target) * 100
    : ((actual - target) / target) * 100;
  if (deviation <= 5) return 'good';
  if (deviation <= 15) return 'warning';
  return 'bad';
}

// ─── KPI Seed ─────────────────────────────────────────────────────────────────

async function seedKpiCatalog(companyId: string) {
  const categoryIdByCode = new Map<string, number>();

  for (const cat of KPI_CATEGORIES) {
    const category = await prisma.kpiCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description, icon: cat.icon, color: cat.color, displayOrder: cat.displayOrder, isActive: true },
      create: { code: cat.code, name: cat.name, description: cat.description, icon: cat.icon, color: cat.color, displayOrder: cat.displayOrder, isActive: true },
    });
    categoryIdByCode.set(cat.code, category.id);
  }

  const kpiIdByCode = new Map<string, number>();
  for (const kpi of KPI_DEFINITIONS) {
    const categoryId = categoryIdByCode.get(kpi.categoryCode);
    if (!categoryId) continue;
    const definition = await prisma.kpiDefinition.upsert({
      where: { code: kpi.code },
      update: { categoryId, name: kpi.name, description: kpi.description, objective: kpi.description, formula: kpi.formula, unit: kpi.unit, unitType: kpi.unitType, indicatorClass: kpi.indicatorClass, direction: kpi.direction, targetValue: kpi.targetValue, responsibleRole: kpi.responsibleRole, dataSource: `chart:${kpi.chartType}`, periodicity: 'monthly', isActive: true },
      create: { code: kpi.code, categoryId, name: kpi.name, description: kpi.description, objective: kpi.description, formula: kpi.formula, unit: kpi.unit, unitType: kpi.unitType, indicatorClass: kpi.indicatorClass, direction: kpi.direction, targetValue: kpi.targetValue, responsibleRole: kpi.responsibleRole, dataSource: `chart:${kpi.chartType}`, periodicity: 'monthly', isActive: true },
    });
    kpiIdByCode.set(kpi.code, definition.id);
  }

  // Genera 12 meses de histórico con tendencia realista (no puro ruido)
  const currentYear = new Date().getFullYear();
  let valuesCreated = 0;
  for (const kpi of KPI_DEFINITIONS) {
    const kpiId = kpiIdByCode.get(kpi.code);
    if (!kpiId) continue;
    const target = Number(kpi.targetValue);
    // Tendencia: empieza en 70-85% del target y mejora gradualmente
    let trendBase = target * rnd(0.70, 0.85, 4);
    const trendImprovement = (target - trendBase) / 14; // mejora en 12 meses
    let prevValue: number | null = null;

    for (let month = 0; month < 12; month++) {
      trendBase += trendImprovement;
      const noise = target * rnd(-0.08, 0.08, 4);
      const actual = Math.max(0, Math.round((trendBase + noise) * 100) / 100);
      const varianceAbsolute = Math.round((actual - target) * 100) / 100;
      const variancePercentage = target !== 0 ? Math.round((varianceAbsolute / target) * 10000) / 100 : 0;

      await prisma.kpiValue.create({
        data: {
          kpiId,
          companyId,
          periodDate: new Date(Date.UTC(currentYear, month, 1)),
          actualValue: actual,
          targetValue: target,
          previousValue: prevValue,
          varianceAbsolute,
          variancePercentage,
          status: computeStatus(actual, target, kpi.direction as string),
          dataSourceMetadata: { source: 'seed_v2', month },
        },
      });
      prevValue = actual;
      valuesCreated++;
    }
  }
  return { valuesCreated };
}

// ─── Business Data Seed ───────────────────────────────────────────────────────

async function seedBusinessData(companyId: string, adminUserId: string) {
  // ── 1. Suppliers ──────────────────────────────────────────────────────────
  const supplierData = [
    { code: 'SUP-001', name: 'Logistics Pro Global S.A.S', contact: 'John Díaz', email: 'john@logpro.co', phone: '601-3456789', address: 'Cra 95 #10-20, Bogotá', leadTime: 5, certified: true, rating: 4.5 },
    { code: 'SUP-002', name: 'Empaques de Colombia Ltda', contact: 'María González', email: 'mgonzalez@empaques.co', phone: '604-7654321', address: 'Av. 68 #24-35, Medellín', leadTime: 7, certified: true, rating: 4.2 },
    { code: 'SUP-003', name: 'Transpack Andino S.A', contact: 'Carlos Rivera', email: 'crivera@transpack.co', phone: '602-5559876', address: 'Clle 15 #8-40, Cali', leadTime: 10, certified: false, rating: 3.8 },
    { code: 'SUP-004', name: 'Industrias Metálicas del Norte', contact: 'Ana Pérez', email: 'aperez@imn.co', phone: '605-3334455', address: 'Zona Industrial, Barranquilla', leadTime: 14, certified: true, rating: 4.7 },
    { code: 'SUP-005', name: 'Suministros Tech Express', contact: 'Luis Moreno', email: 'lmoreno@ste.co', phone: '601-2223344', address: 'Cll 80 #45-10, Bogotá', leadTime: 3, certified: false, rating: 3.5 },
  ];
  const suppliers = await Promise.all(
    supplierData.map(s => prisma.supplier.create({
      data: {
        companyId, code: s.code, name: s.name, contactPerson: s.contact,
        email: s.email, phone: s.phone, address: s.address,
        leadTimeDays: s.leadTime, isCertified: s.certified,
        rating: s.rating, status: 'active',
        certificationDate: s.certified ? new Date(2023, 0, 1) : null,
        certificationExpiry: s.certified ? new Date(2026, 11, 31) : null,
        paymentTerms: '30 días',
      }
    }))
  );

  // ── 2. Products ───────────────────────────────────────────────────────────
  const productData = [
    { sku: 'SKU-001', name: 'Pallet Madera Estándar 120x100', cat: 'Almacenamiento', brand: 'PalletPro', unit: 'und', min: 200, max: 1000, cost: 45000, price: 65000, abc: 'A' },
    { sku: 'SKU-002', name: 'Cinta de Embalaje 50mm x 100m', cat: 'Consumibles', brand: 'StickFast', unit: 'rollo', min: 100, max: 500, cost: 8500, price: 12000, abc: 'B' },
    { sku: 'SKU-003', name: 'Estante Metálico 5 Niveles', cat: 'Almacenamiento', brand: 'MetalRack', unit: 'und', min: 20, max: 100, cost: 380000, price: 550000, abc: 'A' },
    { sku: 'SKU-004', name: 'Film Stretch 20 micras', cat: 'Consumibles', brand: 'WrapMax', unit: 'rollo', min: 50, max: 300, cost: 22000, price: 32000, abc: 'B' },
    { sku: 'SKU-005', name: 'Caja Cartón Reforzada 60x40x40', cat: 'Embalaje', brand: 'BoxCorp', unit: 'und', min: 500, max: 3000, cost: 3500, price: 5200, abc: 'A' },
    { sku: 'SKU-006', name: 'Zunchos Plásticos 16mm', cat: 'Consumibles', brand: 'BandPro', unit: 'kg', min: 30, max: 150, cost: 18000, price: 26000, abc: 'C' },
    { sku: 'SKU-007', name: 'Etiquetas Adhesivas A4 (100 hojas)', cat: 'Consumibles', brand: 'LabelMaster', unit: 'paq', min: 50, max: 200, cost: 12000, price: 17500, abc: 'C' },
    { sku: 'SKU-008', name: 'Contenedor Plástico 600L', cat: 'Almacenamiento', brand: 'ContainAll', unit: 'und', min: 10, max: 50, cost: 620000, price: 890000, abc: 'B' },
    { sku: 'SKU-009', name: 'Montacarga Eléctrico 1.5T', cat: 'Equipo', brand: 'LiftTech', unit: 'und', min: 1, max: 5, cost: 45000000, price: 65000000, abc: 'A' },
    { sku: 'SKU-010', name: 'Grapa Neumática Industrial', cat: 'Herramientas', brand: 'AirTool', unit: 'und', min: 5, max: 20, cost: 180000, price: 260000, abc: 'C' },
  ];
  const products = await Promise.all(
    productData.map(p => prisma.product.create({
      data: {
        companyId, sku: p.sku, name: p.name, category: p.cat, brand: p.brand,
        unitOfMeasure: p.unit, minStock: p.min, maxStock: p.max,
        unitCost: p.cost, sellingPrice: p.price,
        abcClassification: p.abc, isActive: true,
        reorderPoint: Math.floor(p.min * 1.2),
        weightKg: rnd(0.5, 50, 2),
      }
    }))
  );

  // ── 3. Warehouses + Locations ──────────────────────────────────────────────
  const warehouse1 = await prisma.warehouse.create({
    data: {
      companyId, code: 'CEDI-BOG', name: 'CEDI Principal Bogotá',
      type: 'CEDI', address: 'Cll 80 #12-34, Zona Franca', city: 'Bogotá',
      totalAreaM2: 3500, usableAreaM2: 2800, storageCapacityUnits: 5000,
      dockDoors: 8, contactPerson: 'Pedro Suárez', contactPhone: '601-5556677',
      isActive: true,
    }
  });
  const warehouse2 = await prisma.warehouse.create({
    data: {
      companyId, code: 'CEDI-MED', name: 'Bodega Regional Medellín',
      type: 'REGIONAL', address: 'Carrera 48 #18-120, Itagüí', city: 'Medellín',
      totalAreaM2: 1800, usableAreaM2: 1400, storageCapacityUnits: 2000,
      dockDoors: 4, contactPerson: 'Sandra Ríos', contactPhone: '604-3334455',
      isActive: true,
    }
  });

  // Locations for warehouse1
  const zones = ['A', 'B', 'C'];
  for (const zone of zones) {
    for (let aisle = 1; aisle <= 3; aisle++) {
      for (let rack = 1; rack <= 4; rack++) {
        await prisma.location.create({
          data: {
            warehouseId: warehouse1.id,
            zone, aisle: `P${aisle}`, rack: `R${rack}`,
            level: 'L1', position: '01',
            locationCode: `${zone}-P${aisle}-R${rack}-L1`,
            locationType: 'PALLET',
            maxWeightKg: 1500, maxVolumeM3: 2.5,
            isOccupied: Math.random() > 0.4,
          }
        });
      }
    }
  }

  // ── 4. Employees ──────────────────────────────────────────────────────────
  const employeeData = [
    { code: 'EMP-001', name: 'Pedro Suárez Gómez', pos: 'Jefe de Bodega', dept: 'Almacenamiento', salary: 3500000, shift: 'Diurno' },
    { code: 'EMP-002', name: 'Sandra Ríos López', pos: 'Supervisora de Inventarios', dept: 'Inventarios', salary: 3200000, shift: 'Diurno' },
    { code: 'EMP-003', name: 'Marco Vargas Torres', pos: 'Operario de Almacén', dept: 'Almacenamiento', salary: 1500000, shift: 'Diurno' },
    { code: 'EMP-004', name: 'Laura Sánchez Mejía', pos: 'Operaria de Almacén', dept: 'Almacenamiento', salary: 1500000, shift: 'Nocturno' },
    { code: 'EMP-005', name: 'Jhon Patiño Restrepo', pos: 'Conductor Tractomula', dept: 'Transporte', salary: 2800000, shift: 'Diurno' },
    { code: 'EMP-006', name: 'Diana Castillo Medina', pos: 'Conductora Camión', dept: 'Transporte', salary: 2600000, shift: 'Diurno' },
    { code: 'EMP-007', name: 'Andrés Muñoz Silva', pos: 'Conductor Furgón', dept: 'Transporte', salary: 2400000, shift: 'Diurno' },
    { code: 'EMP-008', name: 'Natalia Ospina Cano', pos: 'Analista de Compras', dept: 'Compras', salary: 2900000, shift: 'Diurno' },
    { code: 'EMP-009', name: 'Camilo Herrera Díaz', pos: 'Operario de Producción', dept: 'Producción', salary: 1600000, shift: 'Diurno' },
    { code: 'EMP-010', name: 'Valentina Cruz Mora', pos: 'Operaria de Producción', dept: 'Producción', salary: 1600000, shift: 'Nocturno' },
    { code: 'EMP-011', name: 'Felipe Arango Botero', pos: 'Técnico de Mantenimiento', dept: 'Mantenimiento', salary: 2200000, shift: 'Diurno' },
    { code: 'EMP-012', name: 'Carolina Vélez Ochoa', pos: 'Coordinadora Logística', dept: 'Logística', salary: 3800000, shift: 'Diurno' },
    { code: 'EMP-013', name: 'Sebastián Rojas Pinto', pos: 'Analista de Servicio al Cliente', dept: 'Servicio al Cliente', salary: 2400000, shift: 'Diurno' },
    { code: 'EMP-014', name: 'Mónica Fuentes Leal', pos: 'Auxiliar de Despacho', dept: 'Despachos', salary: 1800000, shift: 'Diurno' },
    { code: 'EMP-015', name: 'Roberto Quintero Arias', pos: 'Gerente de Operaciones', dept: 'Gerencia', salary: 8500000, shift: 'Diurno' },
  ];
  const employees = await Promise.all(
    employeeData.map((e, idx) => prisma.employee.create({
      data: {
        companyId, employeeCode: e.code, fullName: e.name,
        position: e.pos, department: e.dept, salary: e.salary,
        shift: e.shift, hireDate: daysAgo(rnd(30, 1000)),
        hourlyRate: Math.round(e.salary / 192), isActive: true,
      }
    }))
  );

  // ── 5. Vehicles ───────────────────────────────────────────────────────────
  const vehicleData = [
    { plate: 'TRK-001', brand: 'Kenworth', model: 'T800', year: 2020, type: 'Tractomula', maxKg: 35000, fuel: 'diesel', own: true },
    { plate: 'TRK-002', brand: 'Freightliner', model: 'Cascadia', year: 2021, type: 'Tractomula', maxKg: 33000, fuel: 'diesel', own: true },
    { plate: 'CAM-001', brand: 'Chevrolet', model: 'NPR 816', year: 2019, type: 'Camión', maxKg: 8000, fuel: 'diesel', own: true },
    { plate: 'FUR-001', brand: 'Mercedes-Benz', model: 'Sprinter 516', year: 2022, type: 'Furgón', maxKg: 3500, fuel: 'diesel', own: false },
    { plate: 'FUR-002', brand: 'Ford', model: 'Transit Custom', year: 2021, type: 'Furgón', maxKg: 2000, fuel: 'gasolina', own: false },
  ];
  const vehicles = await Promise.all(
    vehicleData.map(v => prisma.vehicle.create({
      data: {
        companyId, plateNumber: v.plate, brand: v.brand, model: v.model,
        year: v.year, vehicleType: v.type, maxWeightKg: v.maxKg,
        fuelType: v.fuel, isOwnVehicle: v.own,
        status: 'AVAILABLE',
        insuranceExpiry: new Date(2027, 5, 30),
        technicalReviewExpiry: new Date(2026, 11, 31),
        fuelEfficiency: rnd(8, 15, 1),
        leaseCost: v.own ? null : rnd(1500000, 3000000, 0),
      }
    }))
  );

  // ── 6. Drivers (linked to transport employees) ─────────────────────────────
  const driverEmployees = employees.slice(4, 7); // EMP-005, EMP-006, EMP-007
  const drivers = await Promise.all(
    driverEmployees.map((emp, idx) => prisma.driver.create({
      data: {
        employeeId: emp.id,
        licenseNumber: `LIC-${20000 + idx}`,
        licenseType: idx === 0 ? 'C3' : 'C2',
        licenseExpiry: new Date(2027, 8, 30),
        assignedVehicleId: vehicles[idx].id,
        routesAssigned: idx === 0 ? ['Bogotá-Medellín', 'Bogotá-Cali'] : ['Bogotá-Norte', 'Zona Industrial'],
        isActive: true,
      }
    }))
  );

  // ── 7. Machines ───────────────────────────────────────────────────────────
  const machineData = [
    { code: 'MAQ-001', name: 'Línea de Empaque A1', type: 'Empacadora', brand: 'PackMaster', model: 'PM-500', maxCap: 500, capUnit: 'und/hora', eff: 92, status: 'operational' },
    { code: 'MAQ-002', name: 'Línea de Empaque A2', type: 'Empacadora', brand: 'PackMaster', model: 'PM-500', maxCap: 500, capUnit: 'und/hora', eff: 88, status: 'operational' },
    { code: 'MAQ-003', name: 'Selladora Industrial B1', type: 'Selladora', brand: 'SealTech', model: 'ST-200', maxCap: 300, capUnit: 'und/hora', eff: 95, status: 'operational' },
    { code: 'MAQ-004', name: 'Banda Transportadora C1', type: 'Transporte', brand: 'ConveyPro', model: 'CP-100', maxCap: 1000, capUnit: 'kg/hora', eff: 75, status: 'maintenance' },
    { code: 'MAQ-005', name: 'Prensa Hidráulica D1', type: 'Prensa', brand: 'HydroPRESS', model: 'HP-350', maxCap: 350, capUnit: 'ton/hora', eff: 0, status: 'breakdown' },
    { code: 'MAQ-006', name: 'Robot de Paletizado E1', type: 'Robotizado', brand: 'RoboStack', model: 'RS-800', maxCap: 800, capUnit: 'und/hora', eff: 98, status: 'operational' },
  ];
  const machines = await Promise.all(
    machineData.map(m => prisma.machine.create({
      data: {
        companyId, code: m.code, name: m.name, type: m.type,
        brand: m.brand, model: m.model,
        serialNumber: `SN-${Math.floor(Math.random() * 90000 + 10000)}`,
        maxCapacity: m.maxCap, capacityUnit: m.capUnit,
        efficiencyRate: m.eff, status: m.status,
        installationDate: daysAgo(rnd(200, 1500)),
        lastMaintenance: daysAgo(rnd(10, 60)),
        nextMaintenance: new Date(Date.now() + rnd(15, 90) * 86400000),
        hourlyRate: rnd(50000, 200000, 0),
      }
    }))
  );

  // ── 8. Maintenance Orders ──────────────────────────────────────────────────
  const maintenanceData = [
    { machineIdx: 3, type: 'preventive', title: 'Mantenimiento preventivo banda transportadora', status: 'in_progress', priority: 'high', sched: daysAgo(2) },
    { machineIdx: 4, type: 'corrective', title: 'Reparación urgente prensa hidráulica', status: 'in_progress', priority: 'critical', sched: daysAgo(1) },
    { machineIdx: 0, type: 'preventive', title: 'Lubricación anual línea de empaque A1', status: 'completed', priority: 'medium', sched: daysAgo(30) },
    { machineIdx: 1, type: 'preventive', title: 'Cambio de filtros A2', status: 'completed', priority: 'low', sched: daysAgo(45) },
    { machineIdx: 5, type: 'inspection', title: 'Calibración robot de paletizado', status: 'scheduled', priority: 'medium', sched: new Date(Date.now() + 7 * 86400000) },
    { machineIdx: 2, type: 'preventive', title: 'Revisión sistema eléctrico selladora', status: 'scheduled', priority: 'low', sched: new Date(Date.now() + 14 * 86400000) },
    { machineIdx: 0, type: 'corrective', title: 'Cambio de sensor de velocidad', status: 'completed', priority: 'high', sched: daysAgo(60) },
    { machineIdx: 3, type: 'inspection', title: 'Revisión de rodillos y correas', status: 'scheduled', priority: 'medium', sched: new Date(Date.now() + 3 * 86400000) },
  ];
  await Promise.all(
    maintenanceData.map(mo => prisma.maintenanceOrder.create({
      data: {
        companyId, machineId: machines[mo.machineIdx].id,
        type: mo.type, title: mo.title, status: mo.status, priority: mo.priority,
        scheduledDate: mo.sched,
        startDate: mo.status !== 'scheduled' ? mo.sched : null,
        endDate: mo.status === 'completed' ? new Date(mo.sched.getTime() + rnd(1, 5) * 86400000) : null,
        technician: 'Felipe Arango Botero',
        cost: mo.status === 'completed' ? rnd(200000, 2000000, 0) : null,
        description: `Orden de ${mo.type} programada para asegurar el funcionamiento óptimo del equipo.`,
      }
    }))
  );

  // ── 9. Production Records ──────────────────────────────────────────────────
  const operationalMachines = machines.filter(m => m.status === 'operational');
  const prodEmployee = employees[8]; // Camilo Herrera
  const prodRecords: any[] = [];
  for (const machine of operationalMachines) {
    for (let i = 0; i < 5; i++) {
      const produced = rnd(200, 450);
      const defective = Math.floor(produced * rnd(0.01, 0.05, 4));
      prodRecords.push({
        companyId, machineId: machine.id,
        productId: products[rnd(0, 4, 0)].id,
        operatorId: prodEmployee.id,
        productionDate: daysAgo(i * 7),
        batchNumber: `LOTE-${Date.now()}-${i}`,
        quantityProduced: produced, quantityDefective: defective,
        hoursOperated: rnd(6, 8, 1), downtimeHours: rnd(0, 1.5, 1),
        setupTime: rnd(0.25, 0.75, 2),
      });
    }
  }
  await Promise.all(prodRecords.map(r => prisma.productionRecord.create({ data: r })));

  // ── 10. Customers ─────────────────────────────────────────────────────────
  const customerData = [
    { name: 'Tiendas Éxito S.A.', taxId: '900.123.456-1', email: 'logistica@exito.com', phone: '601-8007777' },
    { name: 'Alkosto Ltda', taxId: '860.007.386-9', email: 'compras@alkosto.com', phone: '601-3334444' },
    { name: 'Jumbo Colombia S.A.S', taxId: '900.256.891-4', email: 'abastecimiento@jumbo.co', phone: '601-5556666' },
    { name: 'D1 S.A.S', taxId: '900.804.906-2', email: 'logistica@tiendasd1.com', phone: '604-2223333' },
    { name: 'Mercado Libre Colombia', taxId: '900.700.248-6', email: 'fulfillment@mercadolibre.co', phone: '601-9998888' },
    { name: 'Rappi S.A.S', taxId: '900.893.707-3', email: 'ops@rappi.com', phone: '601-1112222' },
    { name: 'Olímpica S.A.', taxId: '800.025.229-8', email: 'compras@olimpica.com', phone: '605-4445555' },
    { name: 'Cencosud Colombia S.A.', taxId: '900.016.735-7', email: 'proveedores@cencosud.co', phone: '601-7778888' },
  ];
  const customers = await Promise.all(
    customerData.map(c => prisma.customer.create({
      data: { companyId, name: c.name, taxId: c.taxId, email: c.email, phone: c.phone, isActive: true }
    }))
  );

  // ── 11. Purchase Orders ───────────────────────────────────────────────────
  const poStatuses = ['completed', 'completed', 'completed', 'approved', 'approved', 'pending', 'pending', 'pending', 'completed', 'completed', 'rejected', 'completed'];
  const purchaseOrders: any[] = [];
  for (let i = 0; i < 12; i++) {
    const daysBack = i * 15 + rnd(0, 5);
    const sup = suppliers[i % suppliers.length];
    const prod = products[i % products.length];
    const qty = rnd(50, 300);
    const unitPrice = Number(prod.unitCost) * rnd(0.9, 1.05, 2);
    const total = qty * unitPrice;
    const po = await prisma.purchaseOrder.create({
      data: {
        companyId, supplierId: sup.id, warehouseId: warehouse1.id,
        poNumber: `PO-2026-${String(i + 1).padStart(3, '0')}`,
        orderDate: daysAgo(daysBack),
        expectedDeliveryDate: daysAgo(daysBack - 7),
        actualDeliveryDate: poStatuses[i] === 'completed' ? daysAgo(daysBack - rnd(5, 9)) : null,
        subtotal: total, tax: total * 0.19, totalAmount: total * 1.19,
        currency: 'COP', status: poStatuses[i],
        lines: {
          create: {
            productId: prod.id, quantityOrdered: qty,
            quantityReceived: poStatuses[i] === 'completed' ? qty : poStatuses[i] === 'approved' ? Math.floor(qty * 0.5) : 0,
            quantityRejected: poStatuses[i] === 'completed' ? Math.floor(qty * rnd(0, 0.03, 2)) : 0,
            unitPrice, totalPrice: total,
          }
        }
      }
    });
    purchaseOrders.push(po);
  }

  // ── 12. Sales ─────────────────────────────────────────────────────────────
  const salesList: any[] = [];
  for (let i = 0; i < 20; i++) {
    const daysBack = i * 7 + rnd(0, 3);
    const prod1 = products[i % products.length];
    const prod2 = products[(i + 2) % products.length];
    const qty1 = rnd(10, 80);
    const qty2 = rnd(5, 40);
    const price1 = Number(prod1.sellingPrice);
    const price2 = Number(prod2.sellingPrice);
    const total = qty1 * price1 + qty2 * price2;
    const cost1 = Number(prod1.unitCost);
    const cost2 = Number(prod2.unitCost);
    const totalCost = qty1 * cost1 + qty2 * cost2;
    const customer = customers[i % customers.length];
    const sale = await prisma.sale.create({
      data: {
        companyId,
        invoiceNumber: `FAC-2026-${String(i + 1).padStart(4, '0')}`,
        customerName: customer.name,
        customerDocument: customer.taxId || '',
        saleDate: daysAgo(daysBack),
        subtotal: total / 1.19, tax: total - total / 1.19, totalAmount: total,
        totalCost, grossProfit: total - totalCost,
        currency: 'COP', paymentMethod: i % 3 === 0 ? 'contado' : 'crédito',
        status: 'completed',
        lines: {
          create: [
            { productId: prod1.id, quantity: qty1, unitPrice: price1, unitCost: cost1, totalPrice: qty1 * price1 },
            { productId: prod2.id, quantity: qty2, unitPrice: price2, unitCost: cost2, totalPrice: qty2 * price2 },
          ]
        }
      }
    });
    salesList.push(sale);
  }

  // ── 13. Dispatches ────────────────────────────────────────────────────────
  for (let i = 0; i < 15; i++) {
    const daysBack = i * 5 + rnd(0, 2);
    const isOnTime = Math.random() > 0.2;
    const isComplete = Math.random() > 0.1;
    const isDocOk = Math.random() > 0.08;
    const sale = salesList[i % salesList.length];
    const driver = drivers[i % drivers.length];
    const vehicle = vehicles[i % vehicles.length];
    const customer = customers[i % customers.length];

    await prisma.dispatch.create({
      data: {
        companyId, warehouseId: warehouse1.id,
        saleId: sale.id, vehicleId: vehicle.id, driverId: driver.id,
        customerId: customer.id,
        dispatchNumber: `DESP-2026-${String(i + 1).padStart(3, '0')}`,
        dispatchDate: daysAgo(daysBack),
        dispatchStatus: 'completed',
        deliveredOnTime: isOnTime, deliveredComplete: isComplete, documentationOk: isDocOk,
        perfectDelivery: isOnTime && isComplete && isDocOk,
        receiverName: customer.name,
        deliveryAddress: 'Dirección de entrega cliente',
        promisedDate: daysAgo(daysBack + 1),
        lines: {
          create: {
            productId: products[i % products.length].id,
            quantityRequested: rnd(10, 50),
            quantityDispatched: rnd(10, 50),
            quantityDamaged: Math.random() > 0.9 ? rnd(1, 3) : 0,
          }
        }
      }
    });
  }

  // ── 14. Inventory Movements ───────────────────────────────────────────────
  for (let month = 0; month < 6; month++) {
    for (const prod of products.slice(0, 6)) {
      await prisma.inventoryMovement.create({
        data: {
          companyId, productId: prod.id, warehouseId: warehouse1.id,
          movementType: 'IN', quantity: rnd(100, 500),
          unitCost: Number(prod.unitCost), movementDate: monthStart(month),
          referenceType: 'PURCHASE_ORDER', notes: `Ingreso mensual ${month + 1}`,
        }
      });
      await prisma.inventoryMovement.create({
        data: {
          companyId, productId: prod.id, warehouseId: warehouse1.id,
          movementType: 'OUT', quantity: rnd(50, 300),
          movementDate: new Date(monthStart(month).getTime() + 15 * 86400000),
          referenceType: 'SALE', notes: `Salida ventas mes ${month + 1}`,
        }
      });
    }
  }

  // ── 15. Physical Inventory ────────────────────────────────────────────────
  for (let i = 0; i < 2; i++) {
    for (const prod of products.slice(0, 5)) {
      const theoretical = rnd(200, 600);
      const physical = theoretical - rnd(0, 15);
      await prisma.physicalInventory.create({
        data: {
          companyId, warehouseId: warehouse1.id, productId: prod.id,
          inventoryDate: daysAgo(i === 0 ? 30 : 90),
          theoreticalQuantity: theoretical, physicalQuantity: physical,
          difference: physical - theoretical,
          differenceValue: (physical - theoretical) * Number(prod.unitCost),
          countedBy: adminUserId, verifiedBy: adminUserId,
          reasonCode: 'MERMA', notes: 'Conteo físico periódico',
        }
      });
    }
  }

  // ── 16. Operational Costs ─────────────────────────────────────────────────
  const costTypes = [
    { center: 'Bodega', type: 'Arriendo', amounts: [12000000, 12000000, 12500000] },
    { center: 'Bodega', type: 'Servicios Públicos', amounts: [2500000, 2800000, 3100000] },
    { center: 'Logística', type: 'Personal', amounts: [35000000, 36000000, 37000000] },
    { center: 'Transporte', type: 'Combustible', amounts: [8000000, 8500000, 9000000] },
    { center: 'Transporte', type: 'Seguros', amounts: [3500000, 3500000, 3500000] },
  ];
  for (const ct of costTypes) {
    for (let month = 0; month < 3; month++) {
      await prisma.operationalCost.create({
        data: {
          companyId, warehouseId: warehouse1.id,
          costDate: monthStart(month + 1),
          costCenter: ct.center, costType: ct.type,
          amount: ct.amounts[month], currency: 'COP',
          description: `${ct.type} - ${ct.center}`,
        }
      });
    }
  }

  // ── 17. Transport Costs ───────────────────────────────────────────────────
  for (const vehicle of vehicles.slice(0, 3)) {
    const driver = drivers[vehicles.indexOf(vehicle)] || drivers[0];
    for (let month = 0; month < 3; month++) {
      await prisma.transportCost.create({
        data: {
          companyId, vehicleId: vehicle.id, driverId: driver.id,
          costDate: monthStart(month + 1),
          costType: 'combustible', amount: rnd(1500000, 3000000, 0),
          quantityLiters: rnd(400, 900, 1), pricePerLiter: rnd(4200, 5000, 0),
          distanceKm: rnd(2000, 5000, 0), hoursDriven: rnd(60, 120, 0),
        }
      });
      await prisma.transportCost.create({
        data: {
          companyId, vehicleId: vehicle.id, driverId: driver.id,
          costDate: new Date(monthStart(month + 1).getTime() + 15 * 86400000),
          costType: 'peajes', amount: rnd(200000, 600000, 0),
        }
      });
    }
  }

  // ── 18. Import/Export Records ─────────────────────────────────────────────
  const importExportData = [
    { type: 'IMPORT', prodIdx: 0, supIdx: 0, port_o: 'Shanghai, China', port_d: 'Buenaventura', qty: 200, ucost: 45.5, freight: 1200, insurance: 350, duties: 890, status: 'DELIVERED', daysBack: 30 },
    { type: 'IMPORT', prodIdx: 1, supIdx: 1, port_o: 'Shenzhen, China', port_d: 'Cartagena', qty: 500, ucost: 12.3, freight: 850, insurance: 180, duties: 420, status: 'DELIVERED', daysBack: 60 },
    { type: 'IMPORT', prodIdx: 2, supIdx: 3, port_o: 'Rotterdam, Países Bajos', port_d: 'Buenaventura', qty: 80, ucost: 380, freight: 2200, insurance: 800, duties: 1800, status: 'CUSTOMS', daysBack: 10 },
    { type: 'IMPORT', prodIdx: 0, supIdx: 0, port_o: 'Hamburgo, Alemania', port_d: 'Buenaventura', qty: 150, ucost: 48, freight: 1350, insurance: 400, duties: 950, status: 'IN_TRANSIT', daysBack: 5 },
    { type: 'EXPORT', prodIdx: 0, supIdx: null, port_o: 'Cartagena, Colombia', port_d: 'Miami, USA', qty: 120, ucost: 52, freight: 950, insurance: 280, duties: 600, status: 'DELIVERED', daysBack: 45, customer: 'Global Trade Inc.' },
    { type: 'EXPORT', prodIdx: 1, supIdx: null, port_o: 'Buenaventura, Colombia', port_d: 'Hamburgo, Alemania', qty: 250, ucost: 14.5, freight: 780, insurance: 150, duties: 310, status: 'DELIVERED', daysBack: 75, customer: 'EuroPack GmbH' },
    { type: 'EXPORT', prodIdx: 2, supIdx: null, port_o: 'Cartagena, Colombia', port_d: 'Santos, Brasil', qty: 60, ucost: 410, freight: 1100, insurance: 290, duties: 550, status: 'IN_TRANSIT', daysBack: 8, customer: 'Latam Logistics S.A.' },
  ];
  for (const r of importExportData) {
    const totalCost = (r.qty * r.ucost) + r.freight + r.insurance + r.duties;
    await prisma.importExportRecord.create({
      data: {
        companyId, operationType: r.type,
        productId: products[r.prodIdx].id,
        supplierId: r.supIdx !== null ? suppliers[r.supIdx].id : null,
        customerName: (r as any).customer || null,
        operationDate: daysAgo(r.daysBack), quantity: r.qty,
        unitCostUsd: r.ucost, totalCostUsd: totalCost,
        freightCostUsd: r.freight, insuranceCostUsd: r.insurance, customsDutiesUsd: r.duties,
        portOfOrigin: r.port_o, portOfDestination: r.port_d,
        containerNumber: `CONT-${Math.floor(Math.random() * 9000000 + 1000000)}`,
        blNumber: `BL-2026-${Math.floor(Math.random() * 900 + 100)}`,
        status: r.status,
      }
    });
  }

  return { suppliers, products, warehouse1, warehouse2, employees, vehicles, drivers, machines, customers, salesList };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const passwordHash = await bcrypt.hash('demo123', 10);

  console.log('🧹 Limpiando base de datos...');
  await prisma.$executeRaw`TRUNCATE TABLE kpi_values, inventory_movements, import_export_records, dispatch_lines, dispatches, sale_lines, sales, purchase_order_lines, purchase_orders, physical_inventory, production_records, maintenance_orders, operational_costs, transport_costs, drivers, employees, vehicles, machines, locations, warehouses, products, customers, suppliers RESTART IDENTITY CASCADE`;

  const company = await prisma.company.upsert({
    where: { taxId: 'DEMO-900123456' },
    update: {},
    create: {
      taxId: 'DEMO-900123456', legalName: 'Cadena de Suministros Demo S.A.S',
      tradeName: 'SCILIP Demo', country: 'Colombia', city: 'Bogotá',
      email: 'admin@scilip.co', phone: '601-1234567',
      address: 'Calle 80 #45-10, Bogotá',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: { permissions: { modules: ['*'], companyId: company.id } },
    create: { name: 'ADMIN', description: 'Administrador del sistema', permissions: { modules: ['*'], companyId: company.id } },
  });
  const analystRole = await prisma.role.upsert({
    where: { name: 'ANALYST' },
    update: { permissions: { modules: ['kpis', 'reports', 'inventory'], companyId: company.id } },
    create: { name: 'ANALYST', description: 'Analista logístico', permissions: { modules: ['kpis', 'reports', 'inventory'], companyId: company.id } },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: { passwordHash, roleId: adminRole.id },
    create: { email: 'admin@demo.local', passwordHash, fullName: 'Administrador Demo', roleId: adminRole.id, department: 'Gerencia' },
  });
  await prisma.user.upsert({
    where: { email: 'analista@demo.local' },
    update: { passwordHash, roleId: analystRole.id },
    create: { email: 'analista@demo.local', passwordHash, fullName: 'Analista Demo', roleId: analystRole.id, department: 'Logística' },
  });

  console.log('📊 Sembrando catálogo de KPIs y series históricas...');
  const kpiStats = await seedKpiCatalog(company.id);

  console.log('🏭 Sembrando datos operativos completos...');
  await seedBusinessData(company.id, adminUser.id);

  console.log('\n✅ Seed Extendido Finalizado con Éxito');
  console.log(`   KPI histórico: ${kpiStats.valuesCreated} registros`);
  console.log('   Datos creados: Proveedores, Productos, Bodegas, Empleados,');
  console.log('   Vehículos, Conductores, Máquinas, Clientes, Órdenes de Compra,');
  console.log('   Ventas, Despachos, Inventario, Producción, Costos, Importaciones.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
