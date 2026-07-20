'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel, Title, Text } from '@tremor/react';
import { PlusCircle, X, Pencil, Users, MapPin, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import { AddressPickerModal } from '@/components/ui/address-picker-modal';

const supplierSchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  taxId: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  paymentTerms: z.string().optional(),
  leadTimeDays: z.number().min(0).optional(),
  isCertified: z.boolean().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier?: any | null;
}

export function SupplierModal({ isOpen, onClose, onSuccess, supplier }: SupplierModalProps) {
  const isEditing = !!supplier;
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      code: '',
      name: '',
      taxId: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      contactPhone: '',
      paymentTerms: '',
      leadTimeDays: 0,
      isCertified: false,
    },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        code: supplier.code || '',
        name: supplier.name || '',
        taxId: supplier.taxId || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        contactPerson: supplier.contactPerson || '',
        contactPhone: supplier.contactPhone || '',
        paymentTerms: supplier.paymentTerms || '',
        leadTimeDays: Number(supplier.leadTimeDays) || 0,
        isCertified: supplier.isCertified ?? false,
      });
    } else {
      reset({
        code: '',
        name: '',
        taxId: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        contactPhone: '',
        paymentTerms: '',
        leadTimeDays: 0,
        isCertified: false,
      });
    }
  }, [supplier, reset, isOpen]);

  const createSupplier = trpc.purchasing.createSupplier.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Proveedor creado', text: 'El proveedor se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.purchasing.getSuppliers.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo crear el proveedor.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateSupplier = trpc.purchasing.updateSupplier.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Proveedor actualizado', text: 'Los cambios se guardaron exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.purchasing.getSuppliers.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar el proveedor.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: SupplierFormData) => {
    if (isEditing && supplier) {
      updateSupplier.mutate({ id: supplier.id, data });
    } else {
      createSupplier.mutate(data);
    }
  };

  const isPending = createSupplier.isPending || updateSupplier.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-0">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                {isEditing ? <Pencil className="h-5 w-5 text-amber-600" /> : <Users className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900">
                  {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </Title>
                <Text className="text-xs text-gray-400">
                  {isEditing ? `Modificando: ${supplier?.name}` : 'Registra un nuevo proveedor en el directorio'}
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
          initialAddress={watch('address') || ''}
          onSelect={(address) => {
            setValue('address', address);
            setIsAddressPickerOpen(false);
          }}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Información General */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Código *</Text>
                <input {...register('code')} placeholder="Ej: SUP-001" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.code && <Text className="text-red-500 text-xs mt-1">{errors.code.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Nombre *</Text>
                <input {...register('name')} placeholder="Ej: Logistics Pro Global" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">NIT / Tax ID</Text>
                <input {...register('taxId')} placeholder="Ej: 900.123.456-1" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Email</Text>
                <input type="email" {...register('email')} placeholder="proveedor@email.com" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>}
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Teléfono</Text>
                <input {...register('phone')} placeholder="Ej: +57 123 456 7890" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Persona de Contacto</Text>
                <input {...register('contactPerson')} placeholder="Ej: John Doe" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Teléfono de Contacto</Text>
                <input {...register('contactPhone')} placeholder="Ej: +57 987 654 3210" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Términos de Pago</Text>
                <input {...register('paymentTerms')} placeholder="Ej: Net 30 días" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Dirección con mapa */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ubicación</h3>
            <div>
              <Text className="mb-1.5 text-sm font-semibold text-gray-700">Dirección</Text>
              <div className="flex items-stretch">
                <input
                  {...register('address')}
                  placeholder="Ej: Calle 95 #10-20, Bogotá, Colombia"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-l-lg rounded-r-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
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
          </div>

          {/* Especificaciones */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Especificaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700">Lead Time (días)</Text>
                <input type="number" {...register('leadTimeDays', { valueAsNumber: true })} placeholder="0" min={0} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input type="checkbox" {...register('isCertified')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <Text className="text-sm text-gray-700">Proveedor Certificado</Text>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 -mx-6 -mb-5 rounded-b-xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  {isEditing ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                  {isEditing ? 'Guardar Cambios' : 'Crear Proveedor'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
