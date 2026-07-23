'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { Package, ChevronLeft, ChevronRight, Pencil, Trash2, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';

interface Dispatch {
  id: string;
  dispatchNumber?: string;
  dispatchDate: string | Date;
  promisedDate?: string | Date;
  dispatchStatus?: string;
  deliveredOnTime?: boolean;
  deliveredComplete?: boolean;
  documentationOk?: boolean;
  deliveryAddress?: string;
  receiverName?: string;
  customer?: { name?: string };
  vehicle?: { plateNumber?: string };
  driver?: { employee?: { fullName?: string } };
  lines?: any[];
}

interface DispatchesTableProps {
  dispatches: Dispatch[] | any[];
  onEdit?: (dispatch: Dispatch) => void;
  onUpdateStatus?: (dispatch: Dispatch, status: string) => void;
}

const ITEMS_PER_PAGE = 10;

const statusMap: Record<string, { label: string; class: string; icon: any }> = {
  pending: { label: 'Pendiente', class: 'bg-gray-50 text-gray-700 dark:text-dark-tremor-content border border-gray-200 dark:border-dark-tremor-border', icon: Clock },
  in_transit: { label: 'En Camino', class: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Truck },
  delivered: { label: 'Entregado', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', class: 'bg-red-50 text-red-700 border border-red-200', icon: XCircle },
};

export function DispatchesTable({ dispatches, onEdit, onUpdateStatus }: DispatchesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();

  const deleteDispatch = trpc.customerService.deleteDispatch.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Despacho cancelado', text: 'El despacho se canceló exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.customerService.getDispatches.invalidate();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo cancelar el despacho.', confirmButtonColor: '#4F46E5' });
    },
  });

  const handleDelete = (dispatch: Dispatch) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Cancelar despacho?',
      text: `Cancelar despacho "${dispatch.dispatchNumber || ''}"?`,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && dispatch.id) {
        deleteDispatch.mutate({ id: dispatch.id });
      }
    });
  };

  const handleStatusChange = (dispatch: Dispatch, newStatus: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(dispatch, newStatus);
    }
  };

  if (!dispatches || dispatches.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
          <Package className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Despachos</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
          <Package className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay despachos registrados</p>
          <p className="text-gray-400 text-xs mt-1">Registra despachos para hacer seguimiento de entregas</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(dispatches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = dispatches.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <Package className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Despachos</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 px-2 py-0.5 rounded-full">
          {dispatches.length} despachos
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Despacho</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Fechas</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Calidad</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((dispatch) => {
              const statusKey = (dispatch.dispatchStatus || '').toLowerCase();
              const status = statusMap[statusKey] || statusMap.pending;
              const StatusIcon = status.icon;
              return (
                <tr key={dispatch.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-dark-tremor-content-strong block text-xs">{dispatch.dispatchNumber || '-'}</span>
                        <span className="text-[10px] text-gray-400">{dispatch.lines?.length || 0} ítems</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-dark-tremor-content text-xs">
                    <div className="font-medium">{dispatch.customer?.name || '-'}</div>
                    <div className="text-gray-400">{dispatch.deliveryAddress || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-dark-tremor-content">
                    <div>
                      <span className="text-gray-400">Prog:</span>{' '}
                      {dispatch.dispatchDate ? new Date(dispatch.dispatchDate).toLocaleDateString('es-CO') : '-'}
                    </div>
                    {dispatch.promisedDate && (
                      <div>
                        <span className="text-gray-400">Prom:</span>{' '}
                        {new Date(dispatch.promisedDate).toLocaleDateString('es-CO')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.class}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {dispatch.deliveredOnTime && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold" title="A tiempo">AT</span>
                      )}
                      {dispatch.deliveredComplete && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold" title="Completo">CM</span>
                      )}
                      {dispatch.documentationOk && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold" title="Doc OK">DO</span>
                      )}
                      {!dispatch.deliveredOnTime && !dispatch.deliveredComplete && !dispatch.documentationOk && (
                        <span className="text-[10px] text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {dispatch.dispatchStatus !== 'delivered' && dispatch.dispatchStatus !== 'cancelled' && (
                        <select
                          value={dispatch.dispatchStatus || ''}
                          onChange={(e) => handleStatusChange(dispatch, e.target.value)}
                          className="text-[10px] px-1.5 py-1 border border-gray-200 dark:border-dark-tremor-border rounded bg-white dark:bg-dark-tremor-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_transit">En Camino</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelar</option>
                        </select>
                      )}
                      <button onClick={() => onEdit?.(dispatch)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(dispatch)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Cancelar">
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
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, dispatches.length)} de {dispatches.length}
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
