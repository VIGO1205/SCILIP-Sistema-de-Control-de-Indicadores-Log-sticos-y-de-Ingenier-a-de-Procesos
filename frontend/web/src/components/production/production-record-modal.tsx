'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogPanel, Title, Text } from '@tremor/react';
import { PlusCircle, X, ClipboardList, Pencil } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

const recordFormSchema = z.object({
  productionDate: z.string().min(1, 'Fecha es requerida'),
  machineId: z.string().uuid('Máquina es requerida'),
  productId: z.string().uuid('Producto es requerido'),
  batchNumber: z.string().optional(),
  quantityProduced: z.number().min(0, 'Debe ser >= 0'),
  quantityDefective: z.number().min(0).default(0),
  hoursOperated: z.number().min(0, 'Debe ser >= 0'),
  downtimeHours: z.number().min(0).optional(),
  setupTime: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordFormSchema>;

interface ProductionRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record?: any | null;
}

export function ProductionRecordModal({ isOpen, onClose, onSuccess, record }: ProductionRecordModalProps) {
  const isEditing = !!record;
  const utils = trpc.useUtils();

  const { data: machines } = trpc.inventory.getMachines.useQuery();
  const { data: products } = trpc.inventory.getProducts.useQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      productionDate: new Date().toISOString().split('T')[0],
      machineId: '',
      productId: '',
      batchNumber: '',
      quantityProduced: 0,
      quantityDefective: 0,
      hoursOperated: 8,
      downtimeHours: 0,
      setupTime: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (record) {
      reset({
        productionDate: record.productionDate ? new Date(record.productionDate).toISOString().split('T')[0] : '',
        machineId: record.machineId || '',
        productId: record.productId || '',
        batchNumber: record.batchNumber || '',
        quantityProduced: record.quantityProduced || 0,
        quantityDefective: record.quantityDefective || 0,
        hoursOperated: Number(record.hoursOperated) || 0,
        downtimeHours: Number(record.downtimeHours) || 0,
        setupTime: Number(record.setupTime) || 0,
        notes: record.notes || '',
      });
    } else {
      reset({
        productionDate: new Date().toISOString().split('T')[0],
        machineId: '',
        productId: '',
        batchNumber: '',
        quantityProduced: 0,
        quantityDefective: 0,
        hoursOperated: 8,
        downtimeHours: 0,
        setupTime: 0,
        notes: '',
      });
    }
  }, [record, reset, isOpen]);

  const createRecord = trpc.inventory.createProductionRecord.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Registro creado', text: 'La producción se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getProductionRecords.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo crear el registro.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateRecord = trpc.inventory.updateProductionRecord.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Registro actualizado', text: 'Los cambios se guardaron exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getProductionRecords.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar el registro.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: RecordFormData) => {
    const payload = { ...data, productionDate: new Date(data.productionDate) };
    if (isEditing && record) {
      updateRecord.mutate({ id: record.id, data: payload });
    } else {
      createRecord.mutate(payload);
    }
  };

  const isPending = createRecord.isPending || updateRecord.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                {isEditing ? <Pencil className="h-5 w-5 text-amber-600" /> : <ClipboardList className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900">
                  {isEditing ? 'Editar Registro' : 'Nuevo Registro de Producción'}
                </Title>
                <Text className="text-xs text-gray-400">
                  {isEditing ? `Modificando lote: ${record?.batchNumber || '-'}` : 'Registra la producción diaria de una máquina'}
                </Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Información General */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Fecha *</Text>
                <input type="date" {...register('productionDate')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.productionDate && <Text className="text-red-500 text-xs mt-1">{errors.productionDate.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Número de Lote</Text>
                <input {...register('batchNumber')} placeholder="Ej: LOT-2024-001" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Máquina y Producto */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Máquina y Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Máquina *</Text>
                <select {...register('machineId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar máquina...</option>
                  {machines?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
                {errors.machineId && <Text className="text-red-500 text-xs mt-1">{errors.machineId.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Producto *</Text>
                <select {...register('productId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar producto...</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                {errors.productId && <Text className="text-red-500 text-xs mt-1">{errors.productId.message}</Text>}
              </div>
            </div>
          </div>

          {/* Cantidades */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cantidades y Tiempos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Cantidad Producida *</Text>
                <input type="number" {...register('quantityProduced', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.quantityProduced && <Text className="text-red-500 text-xs mt-1">{errors.quantityProduced.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Cantidad Defectuosa</Text>
                <input type="number" {...register('quantityDefective', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Horas Operadas *</Text>
                <input type="number" step="0.1" {...register('hoursOperated', { valueAsNumber: true })} placeholder="8" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.hoursOperated && <Text className="text-red-500 text-xs mt-1">{errors.hoursOperated.message}</Text>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Horas de Parada</Text>
                <input type="number" step="0.1" {...register('downtimeHours', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Tiempo de Setup</Text>
                <input type="number" step="0.1" {...register('setupTime', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">Notas</Text>
            <textarea {...register('notes')} placeholder="Observaciones del turno..." rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 -mx-6 -mb-5 rounded-b-xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50">
              {isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  {isEditing ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                  {isEditing ? 'Guardar Cambios' : 'Registrar Producción'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
