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
      <DialogPanel className="relative z-10 max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-kpi shadow-kpi p-6">
        <Flex justifyContent="between" alignItems="center">
          <Title className="text-xl font-bold text-gray-900">Registrar Costo Operativo</Title>
          <Button variant="light" icon={X} onClick={onClose} className="hover:bg-gray-100" />
        </Flex>
        
        <form onSubmit={handleFormSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Text className="mb-1">Bodega / CEDI</Text>
            <Select 
              value={watch('warehouseId')} 
              onValueChange={(val) => setValue('warehouseId', val)}
              placeholder="Seleccionar bodega..."
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
            <Text className="mb-1">Tipo de Costo</Text>
            <Select 
              value={watch('costType')} 
              onValueChange={(val) => setValue('costType', val as any)}
              placeholder="Seleccionar tipo..."
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
              <Text className="mb-1">Monto (COP)</Text>
              <NumberInput 
                value={watch('amount')} 
                onValueChange={(val) => setValue('amount', val)}
                min={1}
                icon={DollarSign}
              />
              {errors.amount && (
                <Text className="text-red-500 text-sm mt-1">{errors.amount.message}</Text>
              )}
            </div>
            <div>
              <Text className="mb-1">Fecha</Text>
              <DatePicker
                value={watch('costDate')}
                onValueChange={(val) => val && setValue('costDate', val)}
              />
              {errors.costDate && (
                <Text className="text-red-500 text-sm mt-1">{errors.costDate.message}</Text>
              )}
            </div>
          </div>

          <div>
            <Text className="mb-1">Descripción</Text>
            <TextInput 
              placeholder="Detalles adicionales del gasto..." 
              {...register('description')}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Can action={Action.Create} subject="OperationalCost" fallback={
              <Button disabled color="gray">
                Sin permisos
              </Button>
            }>
              <Button 
                loading={createCost.isPending} 
                icon={DollarSign}
                type="submit"
                color="blue"
              >
                Guardar Costo
              </Button>
            </Can>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
