'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogPanel,
  Select,
  SelectItem,
  NumberInput,
  TextInput,
  DatePicker,
  Title,
  Text,
} from '@tremor/react';
import { ShoppingCart, X, Plus, Trash2, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/providers/auth-provider';
import { trpc } from '@/lib/trpc/react';

const purchaseOrderLineSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  quantity: z.number().min(1, 'Minimo 1 unidad'),
  unitPrice: z.number().min(0, 'Precio debe ser positivo'),
});

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Selecciona un proveedor'),
  poNumber: z.string().min(1, 'Numero de orden es requerido'),
  orderDate: z.date({ required_error: 'Fecha de orden es requerida' }),
  expectedDeliveryDate: z.date({ required_error: 'Fecha de entrega es requerida' }),
  warehouseId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']),
  notes: z.string().optional(),
  lines: z.array(purchaseOrderLineSchema).min(1, 'Agrega al menos un producto'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'COMPLETED', label: 'Completado' },
];

function generatePoNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `PO-${y}${m}${d}-${seq}`;
}

export function PurchaseOrderModal({ isOpen, onClose, onSuccess }: PurchaseOrderModalProps) {
  const { can, user, isLoading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    control,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      poNumber: generatePoNumber(),
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      warehouseId: '',
      status: 'PENDING',
      notes: '',
      lines: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const { data: suppliers } = trpc.purchasing.getSuppliers.useQuery();
  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: warehouses } = trpc.warehousing.getWarehouses.useQuery();

  const watchedLines = useWatch({ control, name: 'lines' });

  const totalCalculado = useMemo(() => {
    const lines = watchedLines || [];
    return lines.reduce((sum: number, line: any) => sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0), 0);
  }, [watchedLines]);

  const createPurchaseOrder = trpc.purchasing.createPurchaseOrder.useMutation({
    onSuccess: () => {
      utils.purchasing.getPurchaseOrders.invalidate();
      Swal.fire({
        icon: 'success',
        title: 'Orden creada',
        text: 'La orden de compra se registro exitosamente.',
        confirmButtonColor: '#4F46E5',
        confirmButtonText: 'Entendido',
        timer: 4000,
        timerProgressBar: true,
      });
      onSuccess();
      onClose();
      reset();
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear orden',
        text: error.message || 'Ocurrio un error inesperado. Intenta de nuevo.',
        confirmButtonColor: '#4F46E5',
        confirmButtonText: 'Cerrar',
      });
    },
  });

  const onSubmit = async (data: PurchaseOrderFormData) => {
    createPurchaseOrder.mutate({
      ...data,
      totalAmount: totalCalculado,
      warehouseId: data.warehouseId || undefined,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-kpi shadow-kpi p-0">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 rounded-t-kpi">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900">Nueva Orden de Compra</Title>
                <Text className="text-xs text-gray-400">Completa los datos para registrar la orden</Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleFormSubmit(onSubmit)} className="px-6 py-5 space-y-6">

          {/* Seccion 1: Datos Generales */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Datos Generales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Proveedor *</Text>
                <Select
                  value={watch('supplierId')}
                  onValueChange={(val) => setValue('supplierId', val)}
                  placeholder="Seleccionar proveedor..."
                  className="rounded-lg"
                >
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </Select>
                {errors.supplierId && (
                  <Text className="text-red-500 text-xs mt-1">{errors.supplierId.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Numero de Orden *</Text>
                <TextInput
                  {...register('poNumber')}
                  placeholder="PO-20260720-001"
                  className="rounded-lg"
                />
                {errors.poNumber && (
                  <Text className="text-red-500 text-xs mt-1">{errors.poNumber.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Fecha de Orden *</Text>
                <DatePicker
                  value={watch('orderDate')}
                  onValueChange={(val) => val && setValue('orderDate', val)}
                  className="rounded-lg"
                />
                {errors.orderDate && (
                  <Text className="text-red-500 text-xs mt-1">{errors.orderDate.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Fecha de Entrega Esperada *</Text>
                <DatePicker
                  value={watch('expectedDeliveryDate')}
                  onValueChange={(val) => val && setValue('expectedDeliveryDate', val)}
                  className="rounded-lg"
                />
                {errors.expectedDeliveryDate && (
                  <Text className="text-red-500 text-xs mt-1">{errors.expectedDeliveryDate.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Bodega</Text>
                <Select
                  value={watch('warehouseId') || ''}
                  onValueChange={(val) => setValue('warehouseId', val)}
                  placeholder="Seleccionar bodega..."
                  className="rounded-lg"
                >
                  {warehouses?.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Estado</Text>
                <Select
                  value={watch('status')}
                  onValueChange={(val) => setValue('status', val as any)}
                  className="rounded-lg"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Seccion 2: Lineas de Producto */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productos</h3>
              <button
                type="button"
                onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const lineQuantity = Number(watchedLines?.[index]?.quantity) || 0;
                const linePrice = Number(watchedLines?.[index]?.unitPrice) || 0;
                const lineSubtotal = lineQuantity * linePrice;

                return (
                  <div key={field.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-400">Linea {index + 1}</span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            Swal.fire({
                              title: 'Eliminar producto',
                              text: 'Deseas eliminar esta linea?',
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#EF4444',
                              cancelButtonColor: '#6B7280',
                              confirmButtonText: 'Si, eliminar',
                              cancelButtonText: 'Cancelar',
                            }).then((r) => { if (r.isConfirmed) remove(index); });
                          }}
                          className="p-1 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <Trash2 className="h-4 w-4 text-gray-300 group-hover:text-red-500 transition-colors" />
                        </button>
                      )}
                    </div>

                    <div className="mb-3">
                      <Text className="mb-1 text-xs font-medium text-gray-600">Producto *</Text>
                      <Select
                        value={watch(`lines.${index}.productId`)}
                        onValueChange={(val) => {
                          setValue(`lines.${index}.productId`, val);
                          const selectedProduct = products?.find((p) => p.id === val);
                          if (selectedProduct?.unitCost) {
                            setValue(`lines.${index}.unitPrice`, Number(selectedProduct.unitCost));
                          }
                        }}
                        placeholder="Seleccionar producto..."
                        className="rounded-lg"
                      >
                        {products?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </Select>
                      {errors.lines?.[index]?.productId && (
                        <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.productId?.message}</Text>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <Text className="mb-1 text-xs font-medium text-gray-600">Cantidad *</Text>
                        <NumberInput
                          value={watch(`lines.${index}.quantity`)}
                          onValueChange={(val) => setValue(`lines.${index}.quantity`, val)}
                          min={1}
                          className="rounded-lg"
                        />
                        {errors.lines?.[index]?.quantity && (
                          <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.quantity?.message}</Text>
                        )}
                      </div>
                      <div>
                        <Text className="mb-1 text-xs font-medium text-gray-600">Precio Unitario *</Text>
                        <div className="h-10 flex items-center px-3 bg-gray-100 border border-gray-200 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            $ {linePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {errors.lines?.[index]?.unitPrice && (
                          <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.unitPrice?.message}</Text>
                        )}
                      </div>
                      <div className="hidden md:block">
                        <Text className="mb-1 text-xs font-medium text-gray-600">Subtotal</Text>
                        <div className="h-10 flex items-center px-3 bg-white border border-gray-200 rounded-lg">
                          <span className="text-sm font-bold text-gray-700">
                            $ {lineSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 md:hidden">
                      <Text className="text-xs text-gray-500">
                        Subtotal: <span className="font-bold text-gray-700">
                          $ {lineSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.lines && (
              <Text className="text-red-500 text-sm mt-2">{errors.lines.message}</Text>
            )}

            {/* Total */}
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Total de la Orden</span>
              <span className="text-lg font-bold text-primary">
                $ {totalCalculado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Seccion 3: Notas */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notas</h3>
            <textarea
              {...register('notes')}
              placeholder="Observaciones adicionales sobre la orden..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 -mx-6 -mb-5 rounded-b-kpi flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            {authLoading ? (
              <button disabled className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                Cargando...
              </button>
            ) : (
              <button
                type="submit"
                disabled={createPurchaseOrder.isPending}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
              >
                {createPurchaseOrder.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Crear Orden
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
