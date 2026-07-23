'use client';

import React, { useState } from 'react';
import { Card, Text } from '@tremor/react';
import { Users, Star, Mail, Phone, MapPin, Pencil, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { SupplierRatingModal } from './supplier-rating-modal';
import { trpc } from '@/lib/trpc/react';
import Swal from 'sweetalert2';

interface Supplier {
  id?: string;
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  rating?: number;
  isCertified?: boolean;
  status?: string;
}

interface SuppliersTableProps {
  suppliers: Supplier[] | any[];
  onEdit?: (supplier: Supplier) => void;
}

const ITEMS_PER_PAGE = 10;

export function SuppliersTable({ suppliers, onEdit }: SuppliersTableProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();

  const deleteSupplier = trpc.purchasing.deleteSupplier.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Proveedor eliminado', text: 'El proveedor se inactivó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.purchasing.getSuppliers.invalidate();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo eliminar el proveedor.', confirmButtonColor: '#4F46E5' });
    },
  });

  const handleDelete = (supplier: Supplier) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar proveedor?',
      text: `Inactivar proveedor "${supplier.name}"?`,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && supplier.id) {
        deleteSupplier.mutate({ id: supplier.id });
      }
    });
  };

  const handleOpenModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil((suppliers?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSuppliers = (suppliers || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (!suppliers || suppliers.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border">
          <Users className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Directorio de Proveedores</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <Text className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay proveedores registrados</Text>
          <Text className="text-gray-400 text-xs mt-1">Los proveedores se muestran cuando están activos</Text>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
          <Users className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Directorio de Proveedores</h3>
          <span className="ml-auto text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 px-2 py-0.5 rounded-full">
            {suppliers.length} proveedores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Contacto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Ubicación</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Calificación</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        supplier.isCertified 
                          ? 'bg-success/10 text-success dark:bg-success/20' 
                          : 'bg-gray-100 text-gray-600 dark:bg-dark-tremor-background-muted dark:text-dark-tremor-content-strong'
                      }`}>
                        {supplier.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-dark-tremor-content-strong">{supplier.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-dark-tremor-content-subtle">{supplier.code || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {supplier.email && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-dark-tremor-content">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-xs">{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-dark-tremor-content">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-xs">{supplier.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-dark-tremor-content">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs">{supplier.address || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-3.5 w-3.5 ${
                            star <= (supplier.rating || 0) 
                              ? 'text-warning fill-warning' 
                              : 'text-gray-200'
                          }`} 
                        />
                      ))}
                      <span className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle ml-1">{Number(supplier.rating || 0).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      supplier.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-50 text-gray-700 dark:text-dark-tremor-content border border-gray-200 dark:border-dark-tremor-border'
                    }`}>
                      {supplier.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(supplier)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Editar proveedor"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(supplier)}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="Evaluar proveedor"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Eliminar proveedor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-dark-tremor-border bg-gray-50/50 dark:bg-dark-tremor-background-muted">
            <span className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">
              Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, suppliers.length)} de {suppliers.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-dark-tremor-content" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-dark-tremor-content hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-dark-tremor-content" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <SupplierRatingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplierId={selectedSupplier?.id || ''}
        supplierName={selectedSupplier?.name || ''}
      />
    </>
  );
}
