'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogPanel, Title, Text } from '@tremor/react';
import { PlusCircle, X, Factory, Pencil } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

const machineFormSchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  maxCapacity: z.number().min(0).optional(),
  capacityUnit: z.string().optional(),
  efficiencyRate: z.number().min(0).max(100).optional(),
  hourlyRate: z.number().min(0).optional(),
  status: z.string().optional(),
});

type MachineFormData = z.infer<typeof machineFormSchema>;

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  machine?: any | null;
}

const MACHINE_TYPES = ['Ensamble', 'Corte', 'Soldadura', 'Embalaje', 'Inyección', 'Impresión', 'Calidad'];
const STATUSES = [
  { value: 'operational', label: 'Operativa' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'breakdown', label: 'Avería' },
];

export function MachineModal({ isOpen, onClose, onSuccess, machine }: MachineModalProps) {
  const isEditing = !!machine;
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      code: '', name: '', type: '', brand: '', model: '', serialNumber: '',
      maxCapacity: 0, capacityUnit: 'un/h', efficiencyRate: 100, hourlyRate: 0, status: 'operational',
    },
  });

  useEffect(() => {
    if (machine) {
      reset({
        code: machine.code || '',
        name: machine.name || '',
        type: machine.type || '',
        brand: machine.brand || '',
        model: machine.model || '',
        serialNumber: machine.serialNumber || '',
        maxCapacity: Number(machine.maxCapacity) || 0,
        capacityUnit: machine.capacityUnit || 'un/h',
        efficiencyRate: Number(machine.efficiencyRate) || 100,
        hourlyRate: Number(machine.hourlyRate) || 0,
        status: machine.status || 'operational',
      });
    } else {
      reset({
        code: '', name: '', type: '', brand: '', model: '', serialNumber: '',
        maxCapacity: 0, capacityUnit: 'un/h', efficiencyRate: 100, hourlyRate: 0, status: 'operational',
      });
    }
  }, [machine, reset, isOpen]);

  const createMachine = trpc.inventory.createMachine.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Máquina creada', text: 'La máquina se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getMachines.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo crear la máquina.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateMachine = trpc.inventory.updateMachine.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Máquina actualizada', text: 'Los cambios se guardaron exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getMachines.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar la máquina.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: MachineFormData) => {
    if (isEditing && machine) {
      updateMachine.mutate({ id: machine.id, data });
    } else {
      createMachine.mutate(data);
    }
  };

  const isPending = createMachine.isPending || updateMachine.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-tremor-background rounded-xl shadow-xl p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-tremor-background border-b border-gray-100 dark:border-dark-tremor-border px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                {isEditing ? <Pencil className="h-5 w-5 text-amber-600" /> : <Factory className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900 dark:text-dark-tremor-content-strong">
                  {isEditing ? 'Editar Máquina' : 'Nueva Máquina'}
                </Title>
                <Text className="text-xs text-gray-400 dark:text-dark-tremor-content-subtle">
                  {isEditing ? `Modificando: ${machine?.name}` : 'Registra una nueva máquina o equipo'}
                </Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-dark-tremor-background-muted dark:hover:bg-dark-tremor-background-muted rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Información Básica */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Código *</Text>
                <input {...register('code')} placeholder="Ej: M-001" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
                {errors.code && <Text className="text-red-500 text-xs mt-1">{errors.code.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Nombre *</Text>
                <input {...register('name')} placeholder="Nombre de la máquina" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
                {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>}
              </div>
            </div>
          </div>

          {/* Especificaciones */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Especificaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Tipo</Text>
                <select {...register('type')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content">
                  <option value="">Seleccionar...</option>
                  {MACHINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Marca</Text>
                <input {...register('brand')} placeholder="Ej: Siemens" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Modelo</Text>
                <input {...register('model')} placeholder="Ej: XJ-2000" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Número de Serie</Text>
                <input {...register('serialNumber')} placeholder="Ej: SN123456" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Estado</Text>
                <select {...register('status')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content">
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Capacidad y Costos */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Capacidad y Costos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Capacidad Máxima</Text>
                <input type="number" {...register('maxCapacity', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Unidad de Capacidad</Text>
                <input {...register('capacityUnit')} placeholder="Ej: un/h" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Eficiencia (%)</Text>
                <input type="number" {...register('efficiencyRate', { valueAsNumber: true })} placeholder="100" min={0} max={100} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
            </div>
            <div className="mt-3">
              <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Costo por Hora ($)</Text>
              <input type="number" {...register('hourlyRate', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-dark-tremor-background border-t border-gray-100 dark:border-dark-tremor-border px-6 py-4 -mx-6 -mb-5 rounded-b-xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-tremor-content bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-colors">
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
                  {isEditing ? 'Guardar Cambios' : 'Crear Máquina'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
