'use client';

import React, { useState } from 'react';
import { Card, Text, Badge } from '@tremor/react';
import { FileText, Package, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'amber' },
  APPROVED: { label: 'Aprobado', color: 'blue' },
  REJECTED: { label: 'Rechazado', color: 'red' },
  COMPLETED: { label: 'Completado', color: 'emerald' },
  RECEIVED: { label: 'Recibido', color: 'emerald' },
  CANCELLED: { label: 'Cancelado', color: 'gray' },
  DRAFT: { label: 'Borrador', color: 'gray' },
};

function getStatus(status: string | undefined) {
  if (!status) return { label: 'Desconocido', color: 'gray' };
  const upper = status.toUpperCase();
  return STATUS_MAP[upper] || { label: status, color: 'gray' };
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

export function PurchaseOrdersTable({ orders }: PurchaseOrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!orders || orders.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <FileText className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900">Historial de Órdenes</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 rounded-lg border border-dashed border-gray-200">
          <Package className="h-12 w-12 text-gray-300 mb-4" />
          <Text className="text-gray-500 font-medium">No hay órdenes registradas</Text>
          <Text className="text-gray-400 text-xs mt-1">Crea tu primera orden de compra para verla aquí</Text>
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrega</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => {
              const status = getStatus(order.status);
              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary/60" />
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
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      status.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      status.color === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      status.color === 'blue' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      status.color === 'red' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {status.label}
                    </span>
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
                  page === currentPage
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-200'
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
