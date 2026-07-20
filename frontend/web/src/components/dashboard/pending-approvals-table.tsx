'use client';

import React from 'react';
import { Card, Text, Badge } from '@tremor/react';
import { FileCheck, FileText, Clock, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';

export function PendingApprovalsTable() {
  const { data: purchaseOrders } = trpc.purchasing.getPurchaseOrders.useQuery();
  
  // Filtrar órdenes pendientes de aprobación
  const pendingOrders = purchaseOrders?.filter(
    (o: any) => o.status?.toLowerCase() === 'pending'
  ) || [];

  if (pendingOrders.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
          <FileCheck className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900">Aprobaciones Pendientes</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 rounded-lg border border-dashed border-gray-200 mx-5 mb-5">
          <div className="relative">
            <div className="absolute -inset-2 bg-success/10 rounded-full blur-xl" />
            <FileCheck className="h-12 w-12 text-success mb-4 relative" />
          </div>
          <p className="text-xl font-bold text-gray-900">Todo al día</p>
          <p className="text-gray-500 mt-2 text-center text-sm">
            No hay órdenes de compra pendientes de aprobación en este momento
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
        <FileCheck className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900">Aprobaciones Pendientes</h3>
        <span className="ml-auto text-[10px] font-medium text-white bg-amber-500 px-2 py-0.5 rounded-full">
          {pendingOrders.length} pendiente{pendingOrders.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orden</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary/60" />
                    <span className="font-medium text-gray-900">{order.poNumber}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-600">{order.supplier?.name || '-'}</td>
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
                <td className="px-3 py-3 text-right text-gray-900 font-semibold">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
