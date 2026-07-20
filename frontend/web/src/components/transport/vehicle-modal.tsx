'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogPanel, Title, Text } from '@tremor/react';
import { PlusCircle, X, Truck, Pencil } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

const vehicleFormSchema = z.object({
  plateNumber: z.string().min(1, 'Placa es requerida'),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().min(1900).max(2100).optional(),
  vehicleType: z.string().optional(),
  maxWeightKg: z.number().min(0).optional(),
  maxVolumeM3: z.number().min(0).optional(),
  fuelType: z.string().optional(),
  fuelEfficiency: z.number().min(0).optional(),
  isOwnVehicle: z.boolean().optional(),
  leaseCost: z.number().min(0).optional(),
  status: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle?: any | null;
}

const VEHICLE_TYPES = ['Camión', 'Furgoneta', 'Pickup', 'Tráiler', 'Van', 'Moto', 'Otro'];
const FUEL_TYPES = ['Gasolina', 'Diesel', 'Gas', 'Eléctrico', 'Híbrido'];
const STATUSES = [
  { value: 'active', label: 'Activo' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'inactive', label: 'Inactivo' },
];

export function VehicleModal({ isOpen, onClose, onSuccess, vehicle }: VehicleModalProps) {
  const isEditing = !!vehicle;
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      plateNumber: '', brand: '', model: '', year: new Date().getFullYear(),
      vehicleType: '', maxWeightKg: 0, maxVolumeM3: 0, fuelType: '', fuelEfficiency: 0,
      isOwnVehicle: true, leaseCost: 0, status: 'active',
    },
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        plateNumber: vehicle.plateNumber || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        vehicleType: vehicle.vehicleType || '',
        maxWeightKg: Number(vehicle.maxWeightKg) || 0,
        maxVolumeM3: Number(vehicle.maxVolumeM3) || 0,
        fuelType: vehicle.fuelType || '',
        fuelEfficiency: Number(vehicle.fuelEfficiency) || 0,
        isOwnVehicle: vehicle.isOwnVehicle ?? true,
        leaseCost: Number(vehicle.leaseCost) || 0,
        status: vehicle.status || 'active',
      });
    } else {
      reset({
        plateNumber: '', brand: '', model: '', year: new Date().getFullYear(),
        vehicleType: '', maxWeightKg: 0, maxVolumeM3: 0, fuelType: '', fuelEfficiency: 0,
        isOwnVehicle: true, leaseCost: 0, status: 'active',
      });
    }
  }, [vehicle, reset, isOpen]);

  const createVehicle = trpc.transport.createVehicle.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Vehículo creado', text: 'El vehículo se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.transport.getVehicles.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo crear el vehículo.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateVehicle = trpc.transport.updateVehicle.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Vehículo actualizado', text: 'Los cambios se guardaron exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.transport.getVehicles.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar el vehículo.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    if (isEditing && vehicle) {
      updateVehicle.mutate({ id: vehicle.id, data });
    } else {
      createVehicle.mutate(data);
    }
  };

  const isPending = createVehicle.isPending || updateVehicle.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-0">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                {isEditing ? <Pencil className="h-5 w-5 text-amber-600" /> : <Truck className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900">
                  {isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                </Title>
                <Text className="text-xs text-gray-400">
                  {isEditing ? `Modificando: ${vehicle?.plateNumber}` : 'Registra un nuevo vehículo en la flota'}
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
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Placa *</Text>
                <input {...register('plateNumber')} placeholder="Ej: ABC-123" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.plateNumber && <Text className="text-red-500 text-xs mt-1">{errors.plateNumber.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Año</Text>
                <input type="number" {...register('year', { valueAsNumber: true })} placeholder="2024" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Marca</Text>
                <input {...register('brand')} placeholder="Ej: Toyota" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Modelo</Text>
                <input {...register('model')} placeholder="Ej: Hilux" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Especificaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Tipo</Text>
                <select {...register('vehicleType')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar...</option>
                  {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Combustible</Text>
                <select {...register('fuelType')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar...</option>
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Estado</Text>
                <select {...register('status')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Peso Máx (kg)</Text>
                <input type="number" {...register('maxWeightKg', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Volumen Máx (m³)</Text>
                <input type="number" {...register('maxVolumeM3', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Eficiencia (km/L)</Text>
                <input type="number" step="0.1" {...register('fuelEfficiency', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Propiedad</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isOwnVehicle')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Text className="text-sm text-gray-700">Vehículo propio</Text>
              </label>
            </div>
            {!watch('isOwnVehicle') && (
              <div className="mt-3">
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Costo de Arriendo ($/mes)</Text>
                <input type="number" {...register('leaseCost', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            )}
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
                  {isEditing ? 'Guardar Cambios' : 'Crear Vehículo'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
