'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogPanel, Title, Text } from '@tremor/react';
import { PlusCircle, X, DollarSign, Pencil } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

const costFormSchema = z.object({
  vehicleId: z.string().uuid('Vehículo es requerido'),
  driverId: z.string().uuid().optional(),
  costType: z.string().min(1, 'Tipo es requerido'),
  amount: z.number().min(0, 'Monto debe ser >= 0'),
  costDate: z.string().min(1, 'Fecha es requerida'),
  quantityLiters: z.number().min(0).optional(),
  pricePerLiter: z.number().min(0).optional(),
  distanceKm: z.number().min(0).optional(),
  hoursDriven: z.number().min(0).optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type CostFormData = z.infer<typeof costFormSchema>;

interface TransportCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cost?: any | null;
}

const COST_TYPES = [
  { value: 'FUEL', label: 'Combustible' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'TOLL', label: 'Peajes' },
  { value: 'SALARY', label: 'Salario Conductor' },
  { value: 'INSURANCE', label: 'Seguros' },
  { value: 'OTHER', label: 'Otros Gastos' },
];

export function TransportCostModal({ isOpen, onClose, onSuccess, cost }: TransportCostModalProps) {
  const isEditing = !!cost;
  const utils = trpc.useUtils();

  const { data: vehicles } = trpc.transport.getVehicles.useQuery();
  const { data: drivers } = trpc.transport.getDrivers.useQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CostFormData>({
    resolver: zodResolver(costFormSchema),
    defaultValues: {
      vehicleId: '',
      driverId: '',
      costType: '',
      amount: 0,
      costDate: new Date().toISOString().split('T')[0],
      quantityLiters: 0,
      pricePerLiter: 0,
      distanceKm: 0,
      hoursDriven: 0,
      invoiceNumber: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (cost) {
      reset({
        vehicleId: cost.vehicleId || '',
        driverId: cost.driverId || '',
        costType: cost.costType || '',
        amount: Number(cost.amount) || 0,
        costDate: cost.costDate ? new Date(cost.costDate).toISOString().split('T')[0] : '',
        quantityLiters: Number(cost.quantityLiters) || 0,
        pricePerLiter: Number(cost.pricePerLiter) || 0,
        distanceKm: Number(cost.distanceKm) || 0,
        hoursDriven: Number(cost.hoursDriven) || 0,
        invoiceNumber: cost.invoiceNumber || '',
        notes: cost.notes || '',
      });
    } else {
      reset({
        vehicleId: '',
        driverId: '',
        costType: '',
        amount: 0,
        costDate: new Date().toISOString().split('T')[0],
        quantityLiters: 0,
        pricePerLiter: 0,
        distanceKm: 0,
        hoursDriven: 0,
        invoiceNumber: '',
        notes: '',
      });
    }
  }, [cost, reset, isOpen]);

  const createCost = trpc.transport.createTransportCost.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Costo registrado', text: 'El gasto se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.transport.getTransportCosts.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo registrar el gasto.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateCost = trpc.transport.updateTransportCost.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Costo actualizado', text: 'Los cambios se guardaron exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.transport.getTransportCosts.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar el gasto.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: CostFormData) => {
    const payload = { ...data, costDate: new Date(data.costDate) };
    if (isEditing && cost) {
      updateCost.mutate({ id: cost.id, data: payload });
    } else {
      createCost.mutate(payload);
    }
  };

  const isPending = createCost.isPending || updateCost.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-0">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                {isEditing ? <Pencil className="h-5 w-5 text-amber-600" /> : <DollarSign className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900">
                  {isEditing ? 'Editar Costo' : 'Nuevo Costo de Transporte'}
                </Title>
                <Text className="text-xs text-gray-400">
                  {isEditing ? 'Modificando registro de gasto' : 'Registra un gasto de transporte'}
                </Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Vehículo *</Text>
                <select {...register('vehicleId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar vehículo...</option>
                  {vehicles?.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>
                  ))}
                </select>
                {errors.vehicleId && <Text className="text-red-500 text-xs mt-1">{errors.vehicleId.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Conductor</Text>
                <select {...register('driverId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar conductor...</option>
                  {drivers?.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.employee?.fullName || '-'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Tipo de Gasto *</Text>
                <select {...register('costType')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar...</option>
                  {COST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.costType && <Text className="text-red-500 text-xs mt-1">{errors.costType.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Fecha *</Text>
                <input type="date" {...register('costDate')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.costDate && <Text className="text-red-500 text-xs mt-1">{errors.costDate.message}</Text>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Monto y Detalles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Monto ($) *</Text>
                <input type="number" {...register('amount', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.amount && <Text className="text-red-500 text-xs mt-1">{errors.amount.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Factura</Text>
                <input {...register('invoiceNumber')} placeholder="Número de factura" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Distancia (km)</Text>
                <input type="number" step="0.1" {...register('distanceKm', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
            {watch('costType') === 'FUEL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <Text className="mb-1.5 text-sm font-semibold text-gray-700">Litros Cargados</Text>
                  <input type="number" step="0.1" {...register('quantityLiters', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <Text className="mb-1.5 text-sm font-semibold text-gray-700">Precio por Litro</Text>
                  <input type="number" step="0.01" {...register('pricePerLiter', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
            )}
            <div className="mt-3">
              <Text className="mb-1.5 text-sm font-semibold text-gray-700">Horas de Conducción</Text>
              <input type="number" step="0.1" {...register('hoursDriven', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>

          <div>
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">Notas</Text>
            <textarea {...register('notes')} placeholder="Observaciones adicionales..." rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
          </div>

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
                  {isEditing ? 'Guardar Cambios' : 'Registrar Gasto'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
