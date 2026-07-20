import { z } from 'zod';

// Operational Cost Schema
export const operationalCostSchema = z.object({
  warehouseId: z.string().uuid('ID de bodega inválido'),
  costType: z.enum(['LEASE', 'UTILITIES', 'MAINTENANCE', 'LABOR', 'INSURANCE', 'OTHER'], {
    required_error: 'Tipo de costo es requerido',
  }),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  costDate: z.date({
    required_error: 'Fecha es requerida',
  }),
  description: z.string().optional(),
});

export type OperationalCostFormData = z.infer<typeof operationalCostSchema>;

// Transport Cost Schema
export const transportCostSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  costType: z.enum(['FUEL', 'MAINTENANCE', 'TOLL', 'SALARY', 'INSURANCE', 'OTHER'], {
    required_error: 'Tipo de gasto es requerido',
  }),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  costDate: z.date({
    required_error: 'Fecha es requerida',
  }),
  route: z.string().optional(),
  description: z.string().optional(),
});

export type TransportCostFormData = z.infer<typeof transportCostSchema>;

// Inventory Movement Schema
export const inventoryMovementSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  warehouseId: z.string().uuid('ID de bodega inválido'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'], {
    required_error: 'Tipo de movimiento es requerido',
  }),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>;

// Physical Inventory (Audit) Schema
export const physicalInventorySchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  warehouseId: z.string().uuid('ID de bodega inválido'),
  systemQuantity: z.number().min(0, 'La cantidad no puede ser negativa'),
  physicalQuantity: z.number().min(0, 'La cantidad no puede ser negativa'),
  notes: z.string().optional(),
});

export type PhysicalInventoryFormData = z.infer<typeof physicalInventorySchema>;

// Import/Export Schema
export const importExportSchema = z.object({
  operationType: z.enum(['IMPORT', 'EXPORT'], {
    required_error: 'Tipo de operación es requerido',
  }),
  productId: z.string().uuid('ID de producto inválido'),
  supplierId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  operationDate: z.date({
    required_error: 'Fecha es requerida',
  }),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  unitCostUsd: z.number().min(0, 'El costo unitario no puede ser negativo').optional(),
  totalCostUsd: z.number().min(0, 'El costo total no puede ser negativo').optional(),
  freightCostUsd: z.number().min(0, 'El costo de flete no puede ser negativo').optional(),
  insuranceCostUsd: z.number().min(0, 'El costo de seguro no puede ser negativo').optional(),
  customsDutiesUsd: z.number().min(0, 'Los aranceles no pueden ser negativos').optional(),
  portOfOrigin: z.string().optional(),
  portOfDestination: z.string().optional(),
  containerNumber: z.string().optional(),
  blNumber: z.string().optional(),
  status: z.enum(['IN_TRANSIT', 'PORT_OF_ORIGIN', 'CUSTOMS', 'DELIVERED']).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.operationType === 'IMPORT') {
      return !!data.supplierId;
    }
    return true;
  },
  {
    message: 'Proveedor es requerido para importaciones',
    path: ['supplierId'],
  }
).refine(
  (data) => {
    if (data.operationType === 'EXPORT') {
      return !!data.customerName && data.customerName.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Nombre del cliente es requerido para exportaciones',
    path: ['customerName'],
  }
);

export type ImportExportFormData = z.infer<typeof importExportSchema>;

// Dispatch Schema
export const dispatchSchema = z.object({
  customerId: z.string().uuid('ID de cliente inválido'),
  orderReference: z.string().min(1, 'Referencia de orden es requerida'),
  dispatchDate: z.date({
    required_error: 'Fecha de despacho es requerida',
  }),
  promisedDate: z.date({
    required_error: 'Fecha prometida es requerida',
  }),
  lines: z.array(
    z.object({
      productId: z.string().uuid('ID de producto inválido'),
      quantityRequested: z.number().min(1, 'La cantidad debe ser mayor a 0'),
    })
  ).min(1, 'Debe haber al menos un producto'),
});

export type DispatchFormData = z.infer<typeof dispatchSchema>;
