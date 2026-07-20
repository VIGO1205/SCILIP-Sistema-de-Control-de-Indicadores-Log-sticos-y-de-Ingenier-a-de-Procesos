import { z } from 'zod';

export const PurchaseOrderCsvSchema = z.object({
  po_number: z.string().min(1, 'El número de orden es requerido'),
  supplier_id: z.string().uuid('El ID del proveedor debe ser un UUID válido'),
  warehouse_id: z.string().uuid('El ID del almacén debe ser un UUID válido').optional().or(z.literal('')),
  order_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La fecha de orden debe ser una fecha válida (YYYY-MM-DD)',
  }),
  expected_delivery_date: z.string().optional().or(z.literal('')),
  actual_delivery_date: z.string().optional().or(z.literal('')),
  subtotal: z.string().optional().transform(val => val ? parseFloat(val) : 0),
  tax: z.string().optional().transform(val => val ? parseFloat(val) : 0),
  total_amount: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val), 'El total debe ser un número'),
  currency: z.string().max(3).optional().default('COP'),
  status: z.string().optional().default('pending'),
  rejection_reason: z.string().optional(),
  notes: z.string().optional(),
});

export type PurchaseOrderCsvData = z.infer<typeof PurchaseOrderCsvSchema>;
