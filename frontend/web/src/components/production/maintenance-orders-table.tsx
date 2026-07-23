'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { Wrench, ChevronLeft, ChevronRight, Pencil, Trash2, PlayCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';

interface MaintenanceOrder {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  scheduledDate: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  technician?: string;
  cost?: number | string;
  machine?: { name: string; code: string };
}

interface MaintenanceOrdersTableProps {
  orders: MaintenanceOrder[] | any[];
  onEdit?: (order: MaintenanceOrder) => void;
}

const ITEMS_PER_PAGE = 10;

const statusMap: Record<string, { label: string; class: string; icon: any }> = {
  scheduled: { label: 'Programada', class: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Clock },
  in_progress: { label: 'En Progreso', class: 'bg-amber-50 text-amber-700 border border-amber-200', icon: PlayCircle },
  completed: { label: 'Completada', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', class: 'bg-gray-50 text-gray-700 dark:text-dark-tremor-content border border-gray-200 dark:border-dark-tremor-border', icon: XCircle },
};

const priorityMap: Record<string, { label: string; class: string }> = {
  low: { label: 'Baja', class: 'bg-gray-100 text-gray-600 dark:text-dark-tremor-content' },
  medium: { label: 'Media', class: 'bg-blue-100 text-blue-600' },
  high: { label: 'Alta', class: 'bg-orange-100 text-orange-600' },
  critical: { label: 'Crítica', class: 'bg-red-100 text-red-600' },
};

const typeMap: Record<string, string> = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
  predictivo: 'Predictivo',
};

export function MaintenanceOrdersTable({ orders, onEdit }: MaintenanceOrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();

  const deleteOrder = trpc.inventory.deleteMaintenanceOrder.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Orden eliminada', text: 'La orden de mantenimiento se eliminó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getMaintenanceOrders.invalidate();
      utils.inventory.getMachines.invalidate();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo eliminar la orden.', confirmButtonColor: '#4F46E5' });
    },
  });

  const handleDelete = (order: MaintenanceOrder) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar orden?',
      text: `Eliminar "${order.title}"? Esta acción liberará la máquina si está en progreso.`,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && order.id) {
        deleteOrder.mutate({ id: order.id });
      }
    });
  };

  if (!orders || orders.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
          <Wrench className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Órdenes de Mantenimiento</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
          <Wrench className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay órdenes de mantenimiento</p>
          <p className="text-gray-400 text-xs mt-1">Registra órdenes para monitorear el mantenimiento de tus máquinas</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <Wrench className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Órdenes de Mantenimiento</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 px-2 py-0.5 rounded-full">
          {orders.length} órdenes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Orden</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Máquina</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Tipo</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Prioridad</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Fechas</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((order) => {
              const status = statusMap[order.status || ''] || statusMap.scheduled;
              const priority = priorityMap[order.priority || ''] || priorityMap.medium;
              const StatusIcon = status.icon;
              return (
                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-dark-tremor-content-strong text-xs">{order.title}</div>
                    <div className="text-[10px] text-gray-400">{typeMap[order.type] || order.type}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-dark-tremor-content text-xs">
                    <div className="font-medium">{order.machine?.name || '-'}</div>
                    <div className="text-gray-400">{order.machine?.code || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[10px] text-gray-600 dark:text-dark-tremor-content bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                      {typeMap[order.type] || order.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${priority.class}`}>
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.class}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-dark-tremor-content">
                    <div>
                      <span className="text-gray-400">Prog:</span>{' '}
                      {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('es-CO') : '-'}
                    </div>
                    {order.startDate && (
                      <div>
                        <span className="text-gray-400">Inicio:</span>{' '}
                        {new Date(order.startDate).toLocaleDateString('es-CO')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit?.(order)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(order)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
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
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, orders.length)} de {orders.length}
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
