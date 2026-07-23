'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { FileCheck, FileText, Clock, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import Swal from 'sweetalert2';

export function PendingApprovalsTable() {
  const utils = trpc.useUtils();
  const { data: purchaseOrders, isLoading } = trpc.purchasing.getPurchaseOrders.useQuery();
  const approveMutation = trpc.purchasing.approveOrder.useMutation();
  const rejectMutation = trpc.purchasing.rejectOrder.useMutation();

  const [actioningId, setActioningId] = useState<string | null>(null);

  const pendingOrders = purchaseOrders?.filter(
    (o: any) => o.status?.toLowerCase() === 'pending'
  ) || [];

  const handleApprove = async (order: any) => {
    const result = await Swal.fire({
      title: `¿Aprobar orden ${order.poNumber}?`,
      text: `Proveedor: ${order.supplier?.name} · Total: $${Number(order.totalAmount || 0).toLocaleString('en-US')}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      confirmButtonColor: '#4f46e5',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    setActioningId(order.id);
    try {
      await approveMutation.mutateAsync({ orderId: order.id });
      utils.purchasing.getPurchaseOrders.invalidate();
      Swal.fire({
        title: '¡Orden Aprobada!',
        text: `La orden ${order.poNumber} fue aprobada. Se notificó al creador.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo aprobar', icon: 'error', confirmButtonColor: '#dc2626' });
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (order: any) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: `Rechazar orden ${order.poNumber}`,
      text: 'Indica el motivo del rechazo:',
      input: 'textarea',
      inputPlaceholder: 'Motivo del rechazo (mínimo 5 caracteres)...',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.trim().length < 5) return 'El motivo debe tener al menos 5 caracteres';
      },
    });
    if (!isConfirmed || !reason) return;

    setActioningId(order.id);
    try {
      await rejectMutation.mutateAsync({ orderId: order.id, reason });
      utils.purchasing.getPurchaseOrders.invalidate();
      Swal.fire({
        title: 'Orden Rechazada',
        text: `La orden ${order.poNumber} fue rechazada. Se notificó al creador.`,
        icon: 'info',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message || 'No se pudo rechazar', icon: 'error', confirmButtonColor: '#dc2626' });
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden bg-white dark:bg-dark-tremor-background transition-colors">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      </Card>
    );
  }

  if (pendingOrders.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden bg-white dark:bg-dark-tremor-background transition-colors">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
          <FileCheck className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Aprobaciones Pendientes</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border mx-5 mb-5">
          <div className="relative">
            <div className="absolute -inset-2 bg-emerald-500/10 rounded-full blur-xl" />
            <FileCheck className="h-12 w-12 text-emerald-500 mb-4 relative" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-dark-tremor-content-strong">Todo al día</p>
          <p className="text-gray-500 dark:text-dark-tremor-content-subtle mt-2 text-center text-sm">
            No hay órdenes de compra pendientes de aprobación en este momento
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden bg-white dark:bg-dark-tremor-background transition-colors">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <FileCheck className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Aprobaciones Pendientes</h3>
        <span className="ml-auto text-[10px] font-medium text-white bg-amber-500 px-2 py-0.5 rounded-full">
          {pendingOrders.length} pendiente{pendingOrders.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Orden</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Fecha</th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Total</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Estado</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingOrders.map((order: any) => {
              const isActioning = actioningId === order.id;
              return (
                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span className="font-medium text-gray-900 dark:text-dark-tremor-content-strong">{order.poNumber}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-600 dark:text-dark-tremor-content">{order.supplier?.name || '-'}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('es-CO', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        }) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-gray-900 dark:text-dark-tremor-content-strong font-semibold">
                    ${Number(order.totalAmount || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 0, maximumFractionDigits: 0
                    })}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="h-3 w-3" />
                      Pendiente
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleApprove(order)}
                        disabled={isActioning}
                        title="Aprobar orden"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                      >
                        {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleReject(order)}
                        disabled={isActioning}
                        title="Rechazar orden"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
