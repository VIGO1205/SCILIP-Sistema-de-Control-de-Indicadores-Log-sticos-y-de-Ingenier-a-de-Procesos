'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogPanel, Title, Text } from '@tremor/react';
import { PlusCircle, X, Wrench, Pencil } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

const maintenanceOrderSchema = z.object({
  machineId: z.string().uuid('Máquina es requerida'),
  type: z.enum(['preventivo', 'correctivo', 'predictivo']),
  title: z.string().min(1, 'Título es requerido'),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduledDate: z.string().min(1, 'Fecha programada es requerida'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  technician: z.string().optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type MaintenanceOrderFormData = z.infer<typeof maintenanceOrderSchema>;

interface MaintenanceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order?: any | null;
}

export function MaintenanceOrderModal({ isOpen, onClose, onSuccess, order }: MaintenanceOrderModalProps) {
  const isEditing = !!order;
  const utils = trpc.useUtils();

  const { data: machines } = trpc.inventory.getMachines.useQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MaintenanceOrderFormData>({
    resolver: zodResolver(maintenanceOrderSchema),
    defaultValues: {
      machineId: '',
      type: 'preventivo',
      title: '',
      description: '',
      status: 'scheduled',
      priority: 'medium',
      scheduledDate: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: '',
      technician: '',
      cost: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (order) {
      reset({
        machineId: order.machineId || '',
        type: order.type || 'preventivo',
        title: order.title || '',
        description: order.description || '',
        status: order.status || 'scheduled',
        priority: order.priority || 'medium',
        scheduledDate: order.scheduledDate ? new Date(order.scheduledDate).toISOString().split('T')[0] : '',
        startDate: order.startDate ? new Date(order.startDate).toISOString().split('T')[0] : '',
        endDate: order.endDate ? new Date(order.endDate).toISOString().split('T')[0] : '',
        technician: order.technician || '',
        cost: Number(order.cost) || 0,
        notes: order.notes || '',
      });
    } else {
      reset({
        machineId: '',
        type: 'preventivo',
        title: '',
        description: '',
        status: 'scheduled',
        priority: 'medium',
        scheduledDate: new Date().toISOString().split('T')[0],
        startDate: '',
        endDate: '',
        technician: '',
        cost: 0,
        notes: '',
      });
    }
  }, [order, reset, isOpen]);

  const createOrder = trpc.inventory.createMaintenanceOrder.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Orden creada', text: 'La orden de mantenimiento se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getMaintenanceOrders.invalidate();
      utils.inventory.getMachines.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo crear la orden.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateOrder = trpc.inventory.updateMaintenanceOrder.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Orden actualizada', text: 'Los cambios se guardaron exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getMaintenanceOrders.invalidate();
      utils.inventory.getMachines.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar la orden.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: MaintenanceOrderFormData) => {
    const payload = {
      ...data,
      scheduledDate: new Date(data.scheduledDate),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    };
    if (isEditing && order) {
      updateOrder.mutate({ id: order.id, data: payload });
    } else {
      createOrder.mutate(payload);
    }
  };

  const isPending = createOrder.isPending || updateOrder.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-tremor-background rounded-xl shadow-xl p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-tremor-background border-b border-gray-100 dark:border-dark-tremor-border px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                {isEditing ? <Pencil className="h-5 w-5 text-amber-600" /> : <Wrench className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900 dark:text-dark-tremor-content-strong">
                  {isEditing ? 'Editar Orden de Mantenimiento' : 'Nueva Orden de Mantenimiento'}
                </Title>
                <Text className="text-xs text-gray-400 dark:text-dark-tremor-content-subtle">
                  {isEditing ? `Modificando: ${order?.title}` : 'Registra una orden para mantenimiento de máquinas'}
                </Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-dark-tremor-background-muted dark:hover:bg-dark-tremor-background-muted rounded-lg transition-colors">
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
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Máquina *</Text>
                <select {...register('machineId')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content">
                  <option value="">Seleccionar máquina...</option>
                  {machines?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
                {errors.machineId && <Text className="text-red-500 text-xs mt-1">{errors.machineId.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Título *</Text>
                <input {...register('title')} placeholder="Ej: Cambio de aceite hidráulico" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
                {errors.title && <Text className="text-red-500 text-xs mt-1">{errors.title.message}</Text>}
              </div>
            </div>
            <div className="mt-3">
              <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Descripción</Text>
              <textarea {...register('description')} placeholder="Descripción detallada del trabajo a realizar..." rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
            </div>
          </div>

          {/* Clasificación */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Clasificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Tipo</Text>
                <select {...register('type')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content">
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="predictivo">Predictivo</option>
                </select>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Prioridad</Text>
                <select {...register('priority')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content">
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Estado</Text>
                <select {...register('status')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content">
                  <option value="scheduled">Programada</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
                <Text className="text-[10px] text-gray-400 dark:text-dark-tremor-content-subtle mt-1">
                  "En Progreso" bloqueará la máquina. "Completada" la liberará.
                </Text>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Fechas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Programada *</Text>
                <input type="date" {...register('scheduledDate')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
                {errors.scheduledDate && <Text className="text-red-500 text-xs mt-1">{errors.scheduledDate.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Inicio</Text>
                <input type="date" {...register('startDate')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Fin</Text>
                <input type="date" {...register('endDate')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
            </div>
          </div>

          {/* Costos y Técnico */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Costos y Asignación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Técnico</Text>
                <input {...register('technician')} placeholder="Nombre del técnico asignado" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Costo Estimado ($)</Text>
                <input type="number" {...register('cost', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Notas Adicionales</Text>
            <textarea {...register('notes')} placeholder="Observaciones, repuestos usados, etc." rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-white dark:bg-dark-tremor-background text-gray-900 dark:text-dark-tremor-content" />
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
                  {isEditing ? 'Guardar Cambios' : 'Crear Orden'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
