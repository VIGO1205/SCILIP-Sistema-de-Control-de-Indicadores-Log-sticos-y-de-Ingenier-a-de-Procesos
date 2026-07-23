'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { ClipboardCheck, Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface Audit {
  id?: string;
  inventoryDate?: string | Date;
  product?: { name?: string } | null;
  warehouse?: { name?: string } | null;
  theoreticalQuantity?: number;
  physicalQuantity?: number;
  difference?: number;
  countedBy?: { fullName?: string } | null;
  verifiedBy?: { fullName?: string } | null;
}

interface AuditsTableProps {
  audits: Audit[] | any[];
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

const ITEMS_PER_PAGE = 10;

export function AuditsTable({ audits }: AuditsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!audits || audits.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border">
          <ClipboardCheck className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Auditorías Físicas</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
          <ClipboardCheck className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay auditorías registradas</p>
          <p className="text-gray-400 text-xs mt-1">Registra tu primera auditoría física de inventario</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(audits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAudits = audits.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <ClipboardCheck className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Auditorías Físicas</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 px-2 py-0.5 rounded-full">
          {audits.length} auditorías
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Bodega</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Teórico</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Físico</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Diferencia</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedAudits.map((audit) => {
              const diff = Number(audit.difference || 0);
              return (
                <tr key={audit.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-dark-tremor-content">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs">{formatDate(audit.inventoryDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-dark-tremor-content-strong font-medium">{audit.product?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-dark-tremor-content">{audit.warehouse?.name || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-dark-tremor-content">{audit.theoreticalQuantity ?? 0}</td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-dark-tremor-content-strong font-semibold">{audit.physicalQuantity ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold ${
                      diff === 0 ? 'text-emerald-600 dark:text-emerald-400' : diff > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-dark-tremor-content">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs">{audit.countedBy?.fullName || '-'}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-dark-tremor-border bg-gray-50/50 dark:bg-dark-tremor-background-muted">
          <span className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, audits.length)} de {audits.length}
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
