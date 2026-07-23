'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { Ship, ChevronLeft, ChevronRight, Pencil, Trash2, Anchor, Navigation, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';

interface Operation {
  id: string;
  operationType: string;
  product?: { name?: string };
  supplier?: { name?: string };
  customerName?: string;
  operationDate: string | Date;
  portOfOrigin?: string;
  portOfDestination?: string;
  status: string;
  totalCostUsd: number;
}

interface OperationsTableProps {
  operations: Operation[] | any[];
  type: 'IMPORT' | 'EXPORT';
  onEdit?: (operation: Operation) => void;
}

const ITEMS_PER_PAGE = 10;

const statusMap: Record<string, { label: string; class: string; icon: any }> = {
  in_transit: { label: 'En Tránsito', class: 'bg-cyan-50 text-cyan-700 border border-cyan-200', icon: Ship },
  port_of_origin: { label: 'Puerto Origen', class: 'bg-gray-50 text-gray-700 dark:text-dark-tremor-content border border-gray-200 dark:border-dark-tremor-border', icon: Anchor },
  customs: { label: 'En Aduana', class: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Package },
  delivered: { label: 'Entregado', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: Navigation },
};

export function OperationsTable({ operations, type, onEdit }: OperationsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();

  const deleteOperation = trpc.internationalTrade.deleteOperation.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Operación eliminada', text: 'La operación se eliminó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.internationalTrade.getOperations.invalidate();
      utils.internationalTrade.getMonthlyData.invalidate();
      utils.internationalTrade.getUnitCost.invalidate();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo eliminar la operación.', confirmButtonColor: '#4F46E5' });
    },
  });

  const handleDelete = (operation: Operation) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar operación?',
      text: `Eliminar operación ${type === 'IMPORT' ? 'de importación' : 'de exportación'} del ${new Date(operation.operationDate).toLocaleDateString('es-CO')}?`,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && operation.id) {
        deleteOperation.mutate({ id: operation.id });
      }
    });
  };

  const filtered = operations?.filter((o) => o.operationType === type) || [];

  if (!filtered || filtered.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
          <Ship className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">{type === 'IMPORT' ? 'Importaciones' : 'Exportaciones'}</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
          <Ship className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay {type === 'IMPORT' ? 'importaciones' : 'exportaciones'} registradas</p>
          <p className="text-gray-400 text-xs mt-1">Registra operaciones para hacer seguimiento</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <Ship className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">{type === 'IMPORT' ? 'Importaciones' : 'Exportaciones'}</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 px-2 py-0.5 rounded-full">
          {filtered.length} operaciones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">{type === 'IMPORT' ? 'Proveedor' : 'Cliente'}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">{type === 'IMPORT' ? 'Origen' : 'Destino'}</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Costo Total</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((op) => {
              const statusKey = (op.status || '').toLowerCase().replace(/-/g, '_');
              const status = statusMap[statusKey] || statusMap.in_transit;
              const StatusIcon = status.icon;
              return (
                <tr key={op.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-dark-tremor-content">
                    {new Date(op.operationDate).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-dark-tremor-content-strong text-xs">{op.product?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-dark-tremor-content">
                    {type === 'IMPORT' ? op.supplier?.name || '-' : op.customerName || '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-dark-tremor-content">
                    {type === 'IMPORT' ? op.portOfOrigin || '-' : op.portOfDestination || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.class}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong">
                    ${Number(op.totalCostUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit?.(op)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(op)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-dark-tremor-border bg-gray-50/50 dark:bg-dark-tremor-background-muted">
          <span className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-dark-tremor-content" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${page === currentPage ? 'bg-primary text-white' : 'text-gray-600 dark:text-dark-tremor-content hover:bg-gray-200'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-dark-tremor-content" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
