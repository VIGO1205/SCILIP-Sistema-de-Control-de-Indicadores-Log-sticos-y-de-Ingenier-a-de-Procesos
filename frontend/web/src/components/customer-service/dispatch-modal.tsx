'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel, Title, Text } from '@tremor/react';
import { PlusCircle, X, Truck, Pencil, Plus, Trash2, MapPin } from 'lucide-react';
import { AddressPickerModal } from '@/components/ui/address-picker-modal';
import { trpc } from '@/lib/trpc/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

const dispatchLineSchema = z.object({
  productId: z.string().uuid('Producto es requerido'),
  quantityRequested: z.number().min(1, 'Cantidad mínima 1'),
});

const dispatchFormSchema = z.object({
  customerId: z.string().uuid('Cliente es requerido'),
  orderReference: z.string().min(1, 'Referencia es requerida'),
  dispatchDate: z.string().min(1, 'Fecha es requerida'),
  promisedDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  receiverName: z.string().optional(),
  lines: z.array(dispatchLineSchema).min(1, 'Mínimo 1 producto'),
});

type DispatchFormData = z.infer<typeof dispatchFormSchema>;

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dispatch?: any | null;
}

export function DispatchModal({ isOpen, onClose, onSuccess, dispatch }: DispatchModalProps) {
  const isEditing = !!dispatch;
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: customers } = trpc.customerService.getCustomers.useQuery();
  const { data: products } = trpc.inventory.getProducts.useQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<DispatchFormData>({
    resolver: zodResolver(dispatchFormSchema),
    defaultValues: {
      customerId: '',
      orderReference: '',
      dispatchDate: new Date().toISOString().split('T')[0],
      promisedDate: '',
      deliveryAddress: '',
      receiverName: '',
      lines: [{ productId: '', quantityRequested: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  useEffect(() => {
    if (dispatch) {
      reset({
        customerId: dispatch.customerId || '',
        orderReference: dispatch.dispatchNumber || '',
        dispatchDate: dispatch.dispatchDate ? new Date(dispatch.dispatchDate).toISOString().split('T')[0] : '',
        promisedDate: dispatch.promisedDate ? new Date(dispatch.promisedDate).toISOString().split('T')[0] : '',
        deliveryAddress: dispatch.deliveryAddress || '',
        receiverName: dispatch.receiverName || '',
        lines: dispatch.lines?.map((l: any) => ({
          productId: l.productId || '',
          quantityRequested: l.quantityRequested || 1,
        })) || [{ productId: '', quantityRequested: 1 }],
      });
    } else {
      reset({
        customerId: '',
        orderReference: '',
        dispatchDate: new Date().toISOString().split('T')[0],
        promisedDate: '',
        deliveryAddress: '',
        receiverName: '',
        lines: [{ productId: '', quantityRequested: 1 }],
      });
    }
  }, [dispatch, reset, isOpen]);

  const createDispatch = trpc.customerService.createDispatch.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Despacho creado', text: 'El despacho se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.customerService.getDispatches.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo crear el despacho.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: DispatchFormData) => {
    const payload = {
      ...data,
      dispatchDate: new Date(data.dispatchDate),
      promisedDate: data.promisedDate ? new Date(data.promisedDate) : undefined,
    };
    createDispatch.mutate(payload);
  };

  const isPending = createDispatch.isPending;

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
                  {isEditing ? 'Editar Despacho' : 'Nuevo Despacho'}
                </Title>
                <Text className="text-xs text-gray-400">
                  {isEditing ? `Modificando: ${dispatch?.dispatchNumber || ''}` : 'Registra un nuevo despacho de mercancía'}
                </Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <AddressPickerModal
          isOpen={isAddressPickerOpen}
          onClose={() => setIsAddressPickerOpen(false)}
          initialAddress={watch('deliveryAddress') || ''}
          onSelect={(address) => {
            setValue('deliveryAddress', address);
            setIsAddressPickerOpen(false);
          }}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Cliente *</Text>
                <select {...register('customerId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                  <option value="">Seleccionar cliente...</option>
                  {customers?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.customerId && <Text className="text-red-500 text-xs mt-1">{errors.customerId.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Ref. Pedido *</Text>
                <input {...register('orderReference')} placeholder="Ej: PED-2024-001" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.orderReference && <Text className="text-red-500 text-xs mt-1">{errors.orderReference.message}</Text>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Fecha Despacho *</Text>
                <input type="date" {...register('dispatchDate')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.dispatchDate && <Text className="text-red-500 text-xs mt-1">{errors.dispatchDate.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Fecha Prometida</Text>
                <input type="date" {...register('promisedDate')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Dirección de Entrega</Text>
                <div className="flex items-stretch">
                  <input {...register('deliveryAddress')} placeholder="Ej: Calle 123 # 45-67, Bogotá" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-l-lg rounded-r-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <button
                    type="button"
                    onClick={() => setIsAddressPickerOpen(true)}
                    className="px-3 rounded-l-none rounded-r-lg border border-l-0 border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-primary transition-colors shrink-0 flex items-center justify-center"
                    title="Buscar en mapa"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Nombre del Receptor</Text>
                <input {...register('receiverName')} placeholder="Nombre de quien recibe" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Productos</h3>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Text className="mb-1.5 text-xs font-semibold text-gray-700">Producto {index + 1}</Text>
                    <select {...register(`lines.${index}.productId`)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                      <option value="">Seleccionar...</option>
                      {products?.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                    {errors.lines?.[index]?.productId && <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.productId?.message}</Text>}
                  </div>
                  <div className="w-28">
                    <Text className="mb-1.5 text-xs font-semibold text-gray-700">Cant.</Text>
                    <input type="number" {...register(`lines.${index}.quantityRequested`, { valueAsNumber: true })} min={1} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    {errors.lines?.[index]?.quantityRequested && <Text className="text-red-500 text-xs mt-1">{errors.lines[index]?.quantityRequested?.message}</Text>}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => append({ productId: '', quantityRequested: 1 })}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar Producto
            </button>
            {errors.lines && <Text className="text-red-500 text-xs mt-2">{errors.lines.message}</Text>}
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
                  {isEditing ? 'Guardar Cambios' : 'Crear Despacho'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
