'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import {
  FileText, Package, Calendar, ChevronLeft, ChevronRight,
  PackageCheck, CheckSquare, Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import Swal from 'sweetalert2';

interface PurchaseOrder {
  id?: string;
  poNumber?: string;
  status?: string;
  totalAmount?: number | string;
  orderDate?: string | Date;
  expectedDeliveryDate?: string | Date;
  supplier?: { name?: string } | null;
  warehouse?: { name?: string } | null;
  lines?: any[];
}

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[] | any[];
  onRefresh?: () => void;
}

const STATUS_MAP: Record<string, { label: string; colorClass: string }> = {
  PENDING:   { label: 'Pendiente',  colorClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED:  { label: 'Aprobado',   colorClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  REJECTED:  { label: 'Rechazado',  colorClass: 'bg-red-50 text-red-700 border-red-200' },
  RECEIVED:  { label: 'Recibido',   colorClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  COMPLETED: { label: 'Completado', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Cancelado',  colorClass: 'bg-gray-50 text-gray-500 border-gray-200' },
  DRAFT:     { label: 'Borrador',   colorClass: 'bg-gray-50 text-gray-500 border-gray-200' },
};

function getStatus(status: string | undefined) {
  if (!status) return { label: 'Desconocido', colorClass: 'bg-gray-50 text-gray-500 border-gray-200' };
  return STATUS_MAP[status.toUpperCase()] || { label: status, colorClass: 'bg-gray-50 text-gray-500 border-gray-200' };
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(value: number | string | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return '$ 0';
  return '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const ITEMS_PER_PAGE = 10;

export function PurchaseOrdersTable({ orders, onRefresh }: PurchaseOrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const receiveMutation = trpc.purchasing.receiveOrder.useMutation();
  const completeMutation = trpc.purchasing.completeOrder.useMutation();

  const handleReceive = async (order: PurchaseOrder) => {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: `Marcar como Recibida`,
      html: `
        <p style="font-size:13px;color:#6b7280;margin-bottom:12px;">Orden <strong>${order.poNumber}</strong> · Proveedor: <strong>${order.supplier?.name || '-'}</strong></p>
        <label style="display:block;text-align:left;font-size:11px;font-weight:600;color:#374151;margin-bottom:4px;">Fecha de entrega real</label>
        <input id="swal-date" type="date" class="swal2-input" style="margin:0 0 12px;width:100%;" value="${new Date().toISOString().split('T')[0]}">
        <label style="display:block;text-align:left;font-size:11px;font-weight:600;color:#374151;margin-bottom:4px;">Notas de recepción (opcional)</label>
        <textarea id="swal-notes" class="swal2-textarea" style="margin:0;width:100%;height:80px;" placeholder="Condición del producto, cantidad verificada, observaciones..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Recepción',
      confirmButtonColor: '#7c3aed',
      cancelButtonText: 'Cancelar',
      preConfirm: () => ({
        actualDeliveryDate: (document.getElementById('swal-date') as HTMLInputElement)?.value,
        notes: (document.getElementById('swal-notes') as HTMLTextAreaElement)?.value,
      }),
    });

    if (!isConfirmed || !formValues) return;

    setActioningId(order.id!);
    try {
      await receiveMutation.mutateAsync({
        orderId: order.id!,
        actualDeliveryDate: formValues.actualDeliveryDate ? new Date(formValues.actualDeliveryDate) : undefined,
        notes: formValues.notes || undefined,
      });
      utils.purchasing.getPurchaseOrders.invalidate();
      onRefresh?.();
      Swal.fire({
        title: '¡Mercancía Recibida!',
        text: `La orden ${order.poNumber} fue marcada como RECIBIDA exitosamente.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo actualizar', icon: 'error', confirmButtonColor: '#dc2626' });
    } finally {
      setActioningId(null);
    }
  };

  const handleComplete = async (order: PurchaseOrder) => {
    const result = await Swal.fire({
      title: `¿Cerrar orden ${order.poNumber}?`,
      text: 'Al completar la orden se cierra el proceso de compra. Esta acción no se puede deshacer.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar orden',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    setActioningId(order.id!);
    try {
      await completeMutation.mutateAsync({ orderId: order.id! });
      utils.purchasing.getPurchaseOrders.invalidate();
      onRefresh?.();
      Swal.fire({
        title: '¡Orden Completada!',
        text: `La orden ${order.poNumber} fue cerrada exitosamente.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo completar', icon: 'error', confirmButtonColor: '#dc2626' });
    } finally {
      setActioningId(null);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <FileText className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900">Historial de Órdenes</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 rounded-lg border border-dashed border-gray-200">
          <Package className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No hay órdenes registradas</p>
          <p className="text-gray-400 text-xs mt-1">Crea tu primera orden de compra para verla aquí</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
        <FileText className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900">Historial de Órdenes</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {orders.length} órdenes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orden</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrega Est.</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => {
              const status = getStatus(order.status);
              const st = (order.status || '').toUpperCase();
              const isActioning = actioningId === order.id;

              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span className="font-medium text-gray-900">{order.poNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.supplier?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(order.orderDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(order.expectedDeliveryDate)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-900 font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.colorClass}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {/* Solo APPROVED puede pasar a RECEIVED */}
                    {st === 'APPROVED' && (
                      <button
                        onClick={() => handleReceive(order)}
                        disabled={isActioning}
                        title="Marcar como recibida"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors disabled:opacity-50"
                      >
                        {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackageCheck className="h-3.5 w-3.5" />}
                        Recibir
                      </button>
                    )}
                    {/* Solo RECEIVED puede pasar a COMPLETED */}
                    {st === 'RECEIVED' && (
                      <button
                        onClick={() => handleComplete(order)}
                        disabled={isActioning}
                        title="Cerrar orden"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                      >
                        {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckSquare className="h-3.5 w-3.5" />}
                        Completar
                      </button>
                    )}
                    {/* Estados sin acción posible */}
                    {(st === 'COMPLETED' || st === 'REJECTED' || st === 'CANCELLED' || st === 'PENDING') && (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, orders.length)} de {orders.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${
                  page === currentPage ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'
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
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
