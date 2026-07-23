'use client';

import React from 'react';
import {
  Dialog,
  DialogPanel,
  Select,
  SelectItem,
  NumberInput,
  Title,
  Text,
} from '@tremor/react';
import { PlusCircle, X, ArrowRightLeft, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inventoryMovementSchema, type InventoryMovementFormData } from '@/lib/validations/schemas';
import Swal from 'sweetalert2';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MovementModal({ isOpen, onClose, onSuccess }: MovementModalProps) {
  const { user } = useAuth();
  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: warehouses } = trpc.inventory.getWarehouses.useQuery();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InventoryMovementFormData>({
    resolver: zodResolver(inventoryMovementSchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      type: 'IN',
      quantity: 1,
      reference: '',
      notes: '',
    },
  });

  // Auto-select first warehouse
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !watch('warehouseId')) {
      setValue('warehouseId', warehouses[0].id);
    }
  }, [warehouses, setValue, watch]);

  const createMovement = trpc.inventory.createMovement.useMutation({
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Movimiento registrado',
        text: 'El movimiento de inventario se registró exitosamente.',
        confirmButtonColor: '#4F46E5',
        timer: 3000,
        timerProgressBar: true,
      });
      onSuccess();
      onClose();
      reset({
        productId: '',
        warehouseId: warehouses?.[0]?.id || '',
        type: 'IN',
        quantity: 1,
        reference: '',
        notes: '',
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al registrar el movimiento.',
        confirmButtonColor: '#4F46E5',
      });
    },
  });

  const onSubmit = (data: InventoryMovementFormData) => {
    createMovement.mutate({
      ...data,
      quantity: Number(data.quantity),
    });
  };

  const typeOptions = [
    { value: 'IN', label: 'Entrada (+)', icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-emerald-600' },
    { value: 'OUT', label: 'Salida (-)', icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-red-600' },
    { value: 'ADJUSTMENT', label: 'Ajuste', icon: <RefreshCw className="h-4 w-4" />, color: 'text-amber-600' },
    { value: 'TRANSFER', label: 'Traslado', icon: <ArrowRightLeft className="h-4 w-4" />, color: 'text-blue-600' },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-tremor-background rounded-xl shadow-xl p-0">

        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-tremor-background border-b border-gray-100 dark:border-dark-tremor-border px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900 dark:text-dark-tremor-content-strong">Nuevo Movimiento</Title>
                <Text className="text-xs text-gray-400">Registra entrada, salida o ajuste de inventario</Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-dark-tremor-background-muted dark:hover:bg-dark-tremor-background-muted rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleFormSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Sección: Información General */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Producto *</Text>
                <Select
                  value={watch('productId')}
                  onValueChange={(val) => setValue('productId', val)}
                  placeholder="Seleccionar producto..."
                  className="rounded-lg"
                >
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </Select>
                {errors.productId && (
                  <Text className="text-red-500 text-xs mt-1">{errors.productId.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Bodega *</Text>
                <Select
                  value={watch('warehouseId')}
                  onValueChange={(val) => setValue('warehouseId', val)}
                  placeholder="Seleccionar bodega..."
                  className="rounded-lg"
                >
                  {warehouses?.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </Select>
                {errors.warehouseId && (
                  <Text className="text-red-500 text-xs mt-1">{errors.warehouseId.message}</Text>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Detalle del Movimiento */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detalle del Movimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Tipo *</Text>
                <Select
                  value={watch('type')}
                  onValueChange={(val: any) => setValue('type', val)}
                  className="rounded-lg"
                >
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span className={opt.color}>{opt.icon}</span>
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </Select>
                {errors.type && (
                  <Text className="text-red-500 text-xs mt-1">{errors.type.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Cantidad *</Text>
                <NumberInput
                  value={watch('quantity')}
                  onValueChange={(val) => setValue('quantity', val)}
                  min={1}
                  className="rounded-lg"
                />
                {errors.quantity && (
                  <Text className="text-red-500 text-xs mt-1">{errors.quantity.message}</Text>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Referencia y Notas */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Referencia y Notas</h3>
            <div className="space-y-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Referencia / Documento</Text>
                <input
                  {...register('reference')}
                  placeholder="Ej: OC-123, Factura 45..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Notas</Text>
                <textarea
                  {...register('notes')}
                  placeholder="Observaciones adicionales sobre el movimiento..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer sticky */}
          <div className="sticky bottom-0 bg-white dark:bg-dark-tremor-background border-t border-gray-100 dark:border-dark-tremor-border px-6 py-4 -mx-6 -mb-5 rounded-b-xl flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-tremor-content bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMovement.isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {createMovement.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Registrar Movimiento
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
