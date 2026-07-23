'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogPanel, Select, SelectItem, Title, Text } from '@tremor/react';
import { PlusCircle, X, Package, Tag, Pencil } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

const productFormSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  unitOfMeasure: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any | null;
}

const CATEGORIES = [
  'Papelería', 'Tecnología', 'Empaque', 'Oficina', 'Limpieza', 'Seguridad',
];

const UNITS = [
  { value: 'un', label: 'Unidad' },
  { value: 'resma', label: 'Resma' },
  { value: 'caja', label: 'Caja' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'lt', label: 'Litro' },
  { value: 'm', label: 'Metro' },
];

export function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const isEditing = !!product;
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category: '',
      subcategory: '',
      brand: '',
      unitOfMeasure: 'un',
      unitCost: 0,
      sellingPrice: 0,
      minStock: 0,
      maxStock: 100,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        unitOfMeasure: product.unitOfMeasure || 'un',
        unitCost: Number(product.unitCost) || 0,
        sellingPrice: Number(product.sellingPrice) || 0,
        minStock: product.minStock || 0,
        maxStock: product.maxStock || 100,
      });
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        category: '',
        subcategory: '',
        brand: '',
        unitOfMeasure: 'un',
        unitCost: 0,
        sellingPrice: 0,
        minStock: 0,
        maxStock: 100,
      });
    }
  }, [product, reset, isOpen]);

  const createProduct = trpc.inventory.createProduct.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Producto creado', text: 'El producto se registró exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getProducts.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo crear el producto.', confirmButtonColor: '#4F46E5' });
    },
  });

  const updateProduct = trpc.inventory.updateProduct.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Producto actualizado', text: 'Los cambios se guardaron exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getProducts.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo actualizar el producto.', confirmButtonColor: '#4F46E5' });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (isEditing && product) {
      updateProduct.mutate({ id: product.id, data });
    } else {
      createProduct.mutate(data);
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} static={true} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <DialogPanel className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-tremor-background rounded-xl shadow-xl p-0">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-tremor-background border-b border-gray-100 dark:border-dark-tremor-border px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEditing ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                {isEditing ? <Pencil className="h-5 w-5 text-amber-600" /> : <Package className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Title className="text-lg font-bold text-gray-900 dark:text-dark-tremor-content-strong">
                  {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                </Title>
                <Text className="text-xs text-gray-400">
                  {isEditing ? `Modificando: ${product?.name}` : 'Registra un nuevo producto en el catálogo'}
                </Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-dark-tremor-background-muted dark:hover:bg-dark-tremor-background-muted rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Información Básica */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">SKU *</Text>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('sku')}
                    placeholder="Ej: SKU-001"
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                {errors.sku && <Text className="text-red-500 text-xs mt-1">{errors.sku.message}</Text>}
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Nombre *</Text>
                <input
                  {...register('name')}
                  placeholder="Nombre del producto"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>}
              </div>
            </div>
            <div className="mt-3">
              <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Descripción</Text>
              <textarea
                {...register('description')}
                placeholder="Descripción del producto..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Clasificación */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Clasificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Categoría</Text>
                <Select value={watch('category') || ''} onValueChange={(val) => setValue('category', val)} placeholder="Seleccionar..." className="rounded-lg">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Subcategoría</Text>
                <input
                  {...register('subcategory')}
                  placeholder="Ej: Oficina"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Marca</Text>
                <input
                  {...register('brand')}
                  placeholder="Ej: HP, 3M..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Precios */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Precios y Unidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Unidad de Medida</Text>
                <Select value={watch('unitOfMeasure') || 'un'} onValueChange={(val) => setValue('unitOfMeasure', val)} className="rounded-lg">
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Costo Unitario ($)</Text>
                <input
                  type="number"
                  {...register('unitCost', { valueAsNumber: true })}
                  placeholder="0"
                  min={0}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Precio Venta ($)</Text>
                <input
                  type="number"
                  {...register('sellingPrice', { valueAsNumber: true })}
                  placeholder="0"
                  min={0}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Niveles de Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Stock Mínimo</Text>
                <input
                  type="number"
                  {...register('minStock', { valueAsNumber: true })}
                  placeholder="0"
                  min={0}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <Text className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">Stock Máximo</Text>
                <input
                  type="number"
                  {...register('maxStock', { valueAsNumber: true })}
                  placeholder="100"
                  min={0}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-tremor-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-dark-tremor-background border-t border-gray-100 dark:border-dark-tremor-border px-6 py-4 -mx-6 -mb-5 rounded-b-xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-tremor-content bg-gray-100 dark:bg-dark-tremor-background-muted hover:bg-gray-200 rounded-lg transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  {isEditing ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                  {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
