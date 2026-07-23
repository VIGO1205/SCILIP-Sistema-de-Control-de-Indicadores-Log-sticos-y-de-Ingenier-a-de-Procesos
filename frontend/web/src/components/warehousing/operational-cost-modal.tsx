'use client';

import React from 'react';
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
} from '@tremor/react';
import { DollarSign, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { Can, Action } from '@/components/auth/can';
import { useAuth } from '@/components/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { operationalCostSchema, type OperationalCostFormData } from '@/lib/validations/schemas';

interface OperationalCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COST_TYPES = [
  { value: 'LEASE', label: 'Arrendamiento' },
  { value: 'UTILITIES', label: 'Servicios Públicos' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'LABOR', label: 'Mano de Obra Indirecta' },
  { value: 'INSURANCE', label: 'Seguros' },
  { value: 'OTHER', label: 'Otros Gastos' },
];

export function OperationalCostModal({ isOpen, onClose, onSuccess }: OperationalCostModalProps) {
  const { can } = useAuth();
  const { data: warehouses } = trpc.warehousing.getWarehouses.useQuery();

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<OperationalCostFormData>({
    resolver: zodResolver(operationalCostSchema),
    defaultValues: {
      warehouseId: '',
      costType: undefined,
      amount: 0,
      costDate: new Date(),
      description: '',
    },
  });

  // Autocompletar warehouseId
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !watch('warehouseId')) {
      setValue('warehouseId', warehouses[0].id);
    }
  }, [warehouses, setValue, watch]);

  const createCost = trpc.warehousing.createOperationalCost.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      reset({
        warehouseId: warehouses?.[0]?.id || '',
        costType: undefined,
        amount: 0,
        costDate: new Date(),
        description: '',
      });
    },
  });

  const onSubmit = (data: OperationalCostFormData) => {
    createCost.mutate(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-md w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-tremor-background rounded-kpi shadow-kpi p-6">
        <Flex justifyContent="between" alignItems="center">
          <Title className="text-xl font-bold text-gray-900 dark:text-dark-tremor-content-strong">Registrar Costo Operativo</Title>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-dark-tremor-background-muted dark:hover:bg-dark-tremor-background-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </Flex>
        
        <form onSubmit={handleFormSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Text className="mb-1 text-gray-700 dark:text-dark-tremor-content">Bodega / CEDI</Text>
            <Select 
              value={watch('warehouseId')} 
              onValueChange={(val) => setValue('warehouseId', val)}
              placeholder="Seleccionar bodega..."
              className="rounded-lg"
            >
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </Select>
            {errors.warehouseId && (
              <Text className="text-red-500 text-sm mt-1">{errors.warehouseId.message}</Text>
            )}
          </div>

          <div>
            <Text className="mb-1 text-gray-700 dark:text-dark-tremor-content">Tipo de Costo</Text>
            <Select 
              value={watch('costType')} 
              onValueChange={(val) => setValue('costType', val as any)}
              placeholder="Seleccionar tipo..."
              className="rounded-lg"
            >
              {COST_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>
            {errors.costType && (
              <Text className="text-red-500 text-sm mt-1">{errors.costType.message}</Text>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="mb-1 text-gray-700 dark:text-dark-tremor-content">Monto (COP)</Text>
              <NumberInput 
                value={watch('amount')} 
                onValueChange={(val) => setValue('amount', val)}
                min={1}
                icon={DollarSign}
                className="rounded-lg"
              />
              {errors.amount && (
                <Text className="text-red-500 text-sm mt-1">{errors.amount.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-1 text-gray-700 dark:text-dark-tremor-content">Fecha</Text>
              <DatePicker
                value={watch('costDate')}
                onValueChange={(val) => val && setValue('costDate', val)}
                className="rounded-lg"
              />
              {errors.costDate && (
                <Text className="text-red-500 text-sm mt-1">{errors.costDate.message}</Text>
              )}
            </div>
          </div>

          <div>
            <Text className="mb-1 text-gray-700 dark:text-dark-tremor-content">Descripción</Text>
            <TextInput 
              placeholder="Detalles adicionales del gasto..." 
              {...register('description')}
              className="rounded-lg"
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-tremor-content bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 dark:hover:bg-dark-tremor-background-subtle rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <Can action={Action.Create} subject="OperationalCost" fallback={
              <button disabled className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-dark-tremor-background-muted rounded-lg cursor-not-allowed">
                Sin permisos
              </button>
            }>
              <button
                type="submit"
                disabled={createCost.isPending}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
              >
                {createCost.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    Guardar Costo
                  </>
                )}
              </button>
            </Can>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
