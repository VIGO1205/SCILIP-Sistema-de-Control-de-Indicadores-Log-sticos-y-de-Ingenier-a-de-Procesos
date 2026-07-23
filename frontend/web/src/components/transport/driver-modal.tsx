'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogPanel, Title, Text } from '@tremor/react';
import { PlusCircle, X, Users, Pencil, Truck } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

const driverFormSchema = z.object({
  employeeId: z.string().uuid('Empleado es requerido'),
  licenseNumber: z.string().min(1, 'Número de licencia es requerido'),
  licenseType: z.string().min(1, 'Tipo de licencia es requerido'),
  licenseExpiry: z.string().min(1, 'Fecha de vencimiento es requerida'),
  assignedVehicleId: z.string().uuid().optional(),
  routesAssigned: z.string().optional(),
});

type DriverFormData = z.infer<typeof driverFormSchema>;

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  driver?: any | null;
}

const LICENSE_TYPES = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];

export function DriverModal({ isOpen, onClose, onSuccess, driver }: DriverModalProps) {
  const isEditing = !!driver;
  const utils = trpc.useUtils();

  const { data: vehicles } = trpc.transport.getVehicles.useQuery();
  const { data: availableEmployees } = trpc.transport.getAvailableEmployeesForDriver.useQuery(undefined, {
    enabled: isOpen && !isEditing,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      employeeId: '',
      licenseNumber: '',
      licenseType: '',
      licenseExpiry: '',
      assignedVehicleId: '',
      routesAssigned: '',
    },
  });

  useEffect(() => {
    if (driver) {
      reset({
        employeeId: driver.employeeId || '',
        licenseNumber: driver.licenseNumber || '',
        licenseType: driver.licenseType || '',
        licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
        assignedVehicleId: driver.assignedVehicleId || '',
        routesAssigned: Array.isArray(driver.routesAssigned) ? driver.routesAssigned.join(', ') : driver.routesAssigned || '',
      });
    } else {
      reset({
        employeeId: '',
        licenseNumber: '',
        licenseType: '',
        licenseExpiry: '',
        assignedVehicleId: '',
        routesAssigned: '',
      });
    }
  }, [driver, reset, isOpen]);

  const createDriver = trpc.transport.createDriver.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Conductor registrado', text: 'El conductor se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.transport.getDrivers.invalidate();
      utils.transport.getAvailableEmployeesForDriver.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo registrar el conductor.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateDriver = trpc.transport.updateDriver.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Conductor actualizado', text: 'Los cambios se guardaron exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.transport.getDrivers.invalidate();
      utils.transport.getAvailableEmployeesForDriver.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar el conductor.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: DriverFormData) => {
    const payload = {
      ...data,
      routesAssigned: data.routesAssigned ? data.routesAssigned.split(',').map((r) => r.trim()).filter(Boolean) : [],
    };
    if (isEditing && driver) {
      updateDriver.mutate({ id: driver.id, data: payload });
    } else {
      createDriver.mutate(payload);
    }
  };

  const isPending = createDriver.isPending || updateDriver.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-tremor-background rounded-xl shadow-xl p-0">
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-tremor-background border-b border-gray-100 dark:border-dark-tremor-border px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                {isEditing ? <Pencil className="h-5 w-5 text-amber-600" /> : <Users className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900 dark:text-dark-tremor-content-strong">
                  {isEditing ? 'Editar Conductor' : 'Nuevo Conductor'}
                </Title>
                <Text className="text-xs text-gray-400">
                  {isEditing ? `Modificando: ${driver?.employee?.fullName || ''}` : 'Registra un conductor asociado a un empleado'}
                </Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-dark-tremor-background-muted dark:hover:bg-dark-tremor-background-muted rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información del Conductor</h3>
            {!isEditing && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Text className="text-xs text-blue-700">
                  Selecciona un empleado existente que no esté ya registrado como conductor.
                </Text>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Empleado *</Text>
                {isEditing ? (
                  <input
                    value={driver?.employee?.fullName || ''}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg bg-gray-50 dark:bg-dark-tremor-background-subtle text-gray-500"
                  />
                ) : (
                  <select {...register('employeeId')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                    <option value="">Seleccionar empleado...</option>
                    {availableEmployees?.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
                    ))}
                  </select>
                )}
                {errors.employeeId && <Text className="text-red-500 text-xs mt-1">{errors.employeeId.message}</Text>}
                {!isEditing && (!availableEmployees || availableEmployees.length === 0) && (
                  <Text className="text-amber-600 text-xs mt-1">No hay empleados disponibles. Crea un empleado primero.</Text>
                )}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Vehículo Asignado</Text>
                <select {...register('assignedVehicleId')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Sin asignar</option>
                  {vehicles?.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand} {v.model}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Licencia de Conducción</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Número de Licencia *</Text>
                <input {...register('licenseNumber')} placeholder="Ej: 12345678" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.licenseNumber && <Text className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Categoría *</Text>
                <select {...register('licenseType')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar...</option>
                  {LICENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.licenseType && <Text className="text-red-500 text-xs mt-1">{errors.licenseType.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Fecha de Vencimiento *</Text>
                <input type="date" {...register('licenseExpiry')} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.licenseExpiry && <Text className="text-red-500 text-xs mt-1">{errors.licenseExpiry.message}</Text>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Rutas Asignadas</h3>
            <div>
              <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Rutas (separadas por coma)</Text>
              <input {...register('routesAssigned')} placeholder="Ej: Bogotá-Medellín, Cali-Bogotá" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <Text className="text-[10px] text-gray-400 mt-1">Ingresa las rutas separadas por comas</Text>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-dark-tremor-background border-t border-gray-100 dark:border-dark-tremor-border px-6 py-4 -mx-6 -mb-5 rounded-b-xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-tremor-content bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 rounded-lg transition-colors">
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
                  {isEditing ? 'Guardar Cambios' : 'Registrar Conductor'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
