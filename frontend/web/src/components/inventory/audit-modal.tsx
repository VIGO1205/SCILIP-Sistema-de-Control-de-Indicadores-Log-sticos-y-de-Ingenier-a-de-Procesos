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
import { ClipboardCheck, X, Search, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { physicalInventorySchema, type PhysicalInventoryFormData } from '@/lib/validations/schemas';
import Swal from 'sweetalert2';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuditModal({ isOpen, onClose, onSuccess }: AuditModalProps) {
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
  } = useForm<PhysicalInventoryFormData>({
    resolver: zodResolver(physicalInventorySchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      systemQuantity: 0,
      physicalQuantity: 0,
      notes: '',
    },
  });

  // Auto-select first warehouse
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !watch('warehouseId')) {
      setValue('warehouseId', warehouses[0].id);
    }
  }, [warehouses, setValue, watch]);

  const createAudit = trpc.inventory.createPhysicalInventory.useMutation({
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Auditoría registrada',
        text: 'La auditoría física se registró exitosamente.',
        confirmButtonColor: '#4F46E5',
        timer: 3000,
        timerProgressBar: true,
      });
      onSuccess();
      onClose();
      reset({
        productId: '',
        warehouseId: warehouses?.[0]?.id || '',
        systemQuantity: 0,
        physicalQuantity: 0,
        notes: '',
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al registrar la auditoría.',
        confirmButtonColor: '#4F46E5',
      });
    },
  });

  const onSubmit = (data: PhysicalInventoryFormData) => {
    createAudit.mutate({
      ...data,
      countedById: user?.id || 'current-user-id',
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-0">

        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900">Auditoría de Inventario</Title>
                <Text className="text-xs text-gray-400">Registra conteo físico y compara con sistema</Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleFormSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Sección: Ubicación */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Producto *</Text>
                <Select
                  value={watch('productId')}
                  onValueChange={(val) => setValue('productId', val)}
                  placeholder="Seleccionar producto..."
                  className="rounded-lg"
                >
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</SelectItem>
                  ))}
                </Select>
                {errors.productId && (
                  <Text className="text-red-500 text-xs mt-1">{errors.productId.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Bodega *</Text>
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

          {/* Sección: Conteo */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Conteo Físico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Cantidad en Sistema</Text>
                <div className="h-10 flex items-center px-3 bg-gray-100 border border-gray-200 rounded-lg">
                  <Search className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{watch('systemQuantity') ?? 0}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Calculado desde movimientos de inventario</p>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Cantidad Física *</Text>
                <NumberInput
                  value={watch('physicalQuantity')}
                  onValueChange={(val) => setValue('physicalQuantity', val)}
                  min={0}
                  className="rounded-lg"
                />
                {errors.physicalQuantity && (
                  <Text className="text-red-500 text-xs mt-1">{errors.physicalQuantity.message}</Text>
                )}
              </div>
            </div>
          </div>

          {/* Diferencia calculada */}
          {watch('physicalQuantity') !== undefined && (
            <div className={`p-3 rounded-lg border ${
              (watch('physicalQuantity') || 0) - (watch('systemQuantity') || 0) === 0
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${
                  (watch('physicalQuantity') || 0) - (watch('systemQuantity') || 0) === 0
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`} />
                <span className="text-sm font-semibold text-gray-700">
                  Diferencia: <span className={
                    (watch('physicalQuantity') || 0) - (watch('systemQuantity') || 0) === 0
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }>
                    {(watch('physicalQuantity') || 0) - (watch('systemQuantity') || 0) > 0 ? '+' : ''}
                    {(watch('physicalQuantity') || 0) - (watch('systemQuantity') || 0)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Sección: Notas */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Hallazgos</h3>
            <textarea
              {...register('notes')}
              placeholder="Ej: Diferencia por merma, error de registro, producto dañado..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Footer sticky */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 -mx-6 -mb-5 rounded-b-xl flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createAudit.isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {createAudit.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <ClipboardCheck className="h-4 w-4" />
                  Registrar Auditoría
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
