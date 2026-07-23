'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogPanel,
  NumberInput,
  Select,
  SelectItem,
  Title,
  Text,
  Flex,
  TextInput,
  DatePicker,
  Divider,
} from '@tremor/react';
import { Globe, X, DollarSign, Package, Ship, Anchor, Loader2, MapPin } from 'lucide-react';
import { AddressPickerModal } from '@/components/ui/address-picker-modal';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { importExportSchema, type ImportExportFormData } from '@/lib/validations/schemas';
import Swal from 'sweetalert2';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  operation?: any;
}

export function ImportExportModal({ isOpen, onClose, onSuccess, operation }: ImportExportModalProps) {
  const isEditing = !!operation;
  const [pickerField, setPickerField] = useState<string | null>(null);
  const { data: products } = trpc.inventory.getProducts.useQuery();
  const { data: suppliers } = trpc.purchasing.getSuppliers.useQuery();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ImportExportFormData>({
    resolver: zodResolver(importExportSchema),
    defaultValues: {
      operationType: 'IMPORT',
      productId: '',
      supplierId: '',
      customerName: '',
      operationDate: new Date(),
      quantity: 0,
      unitCostUsd: 0,
      totalCostUsd: 0,
      freightCostUsd: 0,
      insuranceCostUsd: 0,
      customsDutiesUsd: 0,
      portOfOrigin: '',
      portOfDestination: '',
      containerNumber: '',
      blNumber: '',
      status: 'IN_TRANSIT',
      notes: '',
    },
  });

  const operationType = watch('operationType');
  const quantity = watch('quantity');
  const unitCostUsd = watch('unitCostUsd');
  const freightCostUsd = watch('freightCostUsd');
  const insuranceCostUsd = watch('insuranceCostUsd');
  const customsDutiesUsd = watch('customsDutiesUsd');

  // Populate form when editing
  useEffect(() => {
    if (operation) {
      reset({
        operationType: operation.operationType,
        productId: operation.productId || '',
        supplierId: operation.supplierId || '',
        customerName: operation.customerName || '',
        operationDate: new Date(operation.operationDate),
        quantity: Number(operation.quantity),
        unitCostUsd: Number(operation.unitCostUsd),
        totalCostUsd: Number(operation.totalCostUsd),
        freightCostUsd: Number(operation.freightCostUsd),
        insuranceCostUsd: Number(operation.insuranceCostUsd),
        customsDutiesUsd: Number(operation.customsDutiesUsd),
        portOfOrigin: operation.portOfOrigin || '',
        portOfDestination: operation.portOfDestination || '',
        containerNumber: operation.containerNumber || '',
        blNumber: operation.blNumber || '',
        status: operation.status,
        notes: operation.notes || '',
      });
    } else {
      reset({
        operationType: 'IMPORT',
        productId: '',
        supplierId: '',
        customerName: '',
        operationDate: new Date(),
        quantity: 0,
        unitCostUsd: 0,
        totalCostUsd: 0,
        freightCostUsd: 0,
        insuranceCostUsd: 0,
        customsDutiesUsd: 0,
        portOfOrigin: '',
        portOfDestination: '',
        containerNumber: '',
        blNumber: '',
        status: 'IN_TRANSIT',
        notes: '',
      });
    }
  }, [operation, reset]);

  // Calcular costo total automáticamente
  React.useEffect(() => {
    const total = (quantity * unitCostUsd) +
                  (freightCostUsd || 0) +
                  (insuranceCostUsd || 0) +
                  (customsDutiesUsd || 0);
    setValue('totalCostUsd', total);
  }, [quantity, unitCostUsd, freightCostUsd, insuranceCostUsd, customsDutiesUsd, setValue]);

  const createOperation = trpc.internationalTrade.createOperation.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Operación registrada', text: 'La operación se guardó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      onSuccess();
      onClose();
      reset({
        operationType: 'IMPORT',
        productId: '',
        supplierId: '',
        customerName: '',
        operationDate: new Date(),
        quantity: 0,
        unitCostUsd: 0,
        totalCostUsd: 0,
        freightCostUsd: 0,
        insuranceCostUsd: 0,
        customsDutiesUsd: 0,
        portOfOrigin: '',
        portOfDestination: '',
        containerNumber: '',
        blNumber: '',
        status: 'IN_TRANSIT',
        notes: '',
      });
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo registrar la operación.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateOperation = trpc.internationalTrade.updateOperation.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Operación actualizada', text: 'La operación se actualizó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar la operación.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: ImportExportFormData) => {
    if (isEditing && operation) {
      updateOperation.mutate({ id: operation.id, data });
    } else {
      createOperation.mutate(data);
    }
  };

  const isPending = createOperation.isPending || updateOperation.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] bg-white dark:bg-dark-tremor-background rounded-kpi shadow-kpi flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-dark-tremor-background border-b border-gray-100 dark:border-dark-tremor-border px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-kpi">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center">
              <Globe className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <Title className="text-lg font-bold text-gray-900 dark:text-dark-tremor-content-strong">{isEditing ? 'Editar' : 'Registrar'} {operationType === 'IMPORT' ? 'Importación' : 'Exportación'}</Title>
              <Text className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">{isEditing ? 'Actualiza los datos de la operación.' : 'Registra una nueva operación de comercio exterior.'}</Text>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-dark-tremor-background-muted dark:hover:bg-dark-tremor-background-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sección: Información General */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-md bg-gray-100 dark:bg-dark-tremor-background-muted flex items-center justify-center">
                <Package className="h-3.5 w-3.5 text-gray-500 dark:text-dark-tremor-content-subtle" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Información General</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Tipo de Operación</Text>
                <Select
                  value={operationType}
                  onValueChange={(val: any) => setValue('operationType', val)}
                >
                  <SelectItem value="IMPORT">Importación</SelectItem>
                  <SelectItem value="EXPORT">Exportación</SelectItem>
                </Select>
                {errors.operationType && (
                  <Text className="text-red-500 text-xs mt-1">{errors.operationType.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Fecha</Text>
                <DatePicker
                  value={watch('operationDate')}
                  onValueChange={(val) => val && setValue('operationDate', val)}
                />
                {errors.operationDate && (
                  <Text className="text-red-500 text-xs mt-1">{errors.operationDate.message}</Text>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Producto</Text>
                <Select
                  value={watch('productId')}
                  onValueChange={(val) => setValue('productId', val)}
                  placeholder="Seleccionar producto..."
                >
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </Select>
                {errors.productId && (
                  <Text className="text-red-500 text-xs mt-1">{errors.productId.message}</Text>
                )}
              </div>
              {operationType === 'IMPORT' ? (
                <div>
                  <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Proveedor Extranjero</Text>
                  <Select
                    value={watch('supplierId')}
                    onValueChange={(val) => setValue('supplierId', val)}
                    placeholder="Seleccionar proveedor..."
                  >
                    {suppliers?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </Select>
                  {errors.supplierId && (
                    <Text className="text-red-500 text-xs mt-1">{errors.supplierId.message}</Text>
                  )}
                </div>
              ) : (
                <div>
                  <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Cliente Internacional</Text>
                  <TextInput
                    placeholder="Nombre del cliente..."
                    {...register('customerName')}
                  />
                  {errors.customerName && (
                    <Text className="text-red-500 text-xs mt-1">{errors.customerName.message}</Text>
                  )}
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Sección: Costos y Cantidades */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-md bg-gray-100 dark:bg-dark-tremor-background-muted flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-gray-500 dark:text-dark-tremor-content-subtle" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Costos y Cantidades (USD)</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Cantidad</Text>
                <NumberInput
                  value={quantity}
                  onValueChange={(val) => setValue('quantity', val)}
                  min={1}
                />
                {errors.quantity && (
                  <Text className="text-red-500 text-xs mt-1">{errors.quantity.message}</Text>
                )}
              </div>
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Costo Unitario</Text>
                <NumberInput
                  value={unitCostUsd}
                  onValueChange={(val) => setValue('unitCostUsd', val)}
                  min={0}
                  icon={DollarSign}
                />
              </div>
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Flete</Text>
                <NumberInput
                  value={freightCostUsd}
                  onValueChange={(val) => setValue('freightCostUsd', val)}
                  min={0}
                  icon={Ship}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Seguro</Text>
                <NumberInput
                  value={insuranceCostUsd}
                  onValueChange={(val) => setValue('insuranceCostUsd', val)}
                  min={0}
                />
              </div>
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Aranceles</Text>
                <NumberInput
                  value={customsDutiesUsd}
                  onValueChange={(val) => setValue('customsDutiesUsd', val)}
                  min={0}
                />
              </div>
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Costo Total DDP</Text>
                <div className="p-2 bg-gray-100 dark:bg-dark-tremor-background-muted rounded text-center font-bold text-gray-900 dark:text-dark-tremor-content-strong text-sm">
                  ${watch('totalCostUsd').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Sección: Logística Internacional */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-md bg-gray-100 dark:bg-dark-tremor-background-muted flex items-center justify-center">
                <Anchor className="h-3.5 w-3.5 text-gray-500 dark:text-dark-tremor-content-subtle" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Logística Internacional</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Puerto Origen</Text>
                <div className="flex items-stretch">
                  <div className="flex-1 relative">
                    <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Ej: Shanghai, China"
                      {...register('portOfOrigin')}
                      className="w-full px-3 py-2 pl-9 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-l-lg rounded-r-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerField('portOfOrigin')}
                    className="px-3 rounded-l-none rounded-r-lg border border-l-0 border-gray-200 dark:border-dark-tremor-border bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 dark:hover:bg-dark-tremor-background-muted text-gray-600 dark:text-dark-tremor-content hover:text-primary transition-colors shrink-0 flex items-center justify-center"
                    title="Buscar en mapa"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Puerto Destino</Text>
                <div className="flex items-stretch">
                  <div className="flex-1 relative">
                    <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Ej: Buenaventura, Colombia"
                      {...register('portOfDestination')}
                      className="w-full px-3 py-2 pl-9 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-l-lg rounded-r-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerField('portOfDestination')}
                    className="px-3 rounded-l-none rounded-r-lg border border-l-0 border-gray-200 dark:border-dark-tremor-border bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 dark:hover:bg-dark-tremor-background-muted text-gray-600 dark:text-dark-tremor-content hover:text-primary transition-colors shrink-0 flex items-center justify-center"
                    title="Buscar en mapa"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Contenedor / BL</Text>
                <TextInput
                  placeholder="Nº Contenedor o Bill of Lading"
                  {...register('containerNumber')}
                />
              </div>
              <div>
                <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Estado</Text>
                <Select
                  value={watch('status')}
                  onValueChange={(val) => setValue('status', val as any)}
                >
                  <SelectItem value="IN_TRANSIT">En Tránsito</SelectItem>
                  <SelectItem value="PORT_OF_ORIGIN">En Puerto Origen</SelectItem>
                  <SelectItem value="CUSTOMS">En Aduana</SelectItem>
                  <SelectItem value="DELIVERED">Entregado</SelectItem>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Text className="mb-1 text-xs font-medium text-gray-600 dark:text-dark-tremor-content">Notas</Text>
              <TextInput
                placeholder="Observaciones adicionales..."
                {...register('notes')}
              />
            </div>
          </div>
        </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-20 bg-white dark:bg-dark-tremor-background border-t border-gray-100 dark:border-dark-tremor-border px-6 py-4 flex justify-end gap-3 flex-shrink-0 rounded-b-kpi">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-tremor-content bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 dark:hover:bg-dark-tremor-background-muted rounded-lg transition-colors">
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
                  <Globe className="h-4 w-4" />
                  {isEditing ? 'Guardar Cambios' : 'Confirmar Operación'}
                </>
              )}
            </button>
          </div>
        </form>

        <AddressPickerModal
          isOpen={!!pickerField}
          onClose={() => setPickerField(null)}
          initialAddress={pickerField ? watch(pickerField as any) || '' : ''}
          onSelect={(address) => {
            if (pickerField) {
              setValue(pickerField as any, address);
              setPickerField(null);
            }
          }}
        />
      </DialogPanel>
    </Dialog>
  );
}
