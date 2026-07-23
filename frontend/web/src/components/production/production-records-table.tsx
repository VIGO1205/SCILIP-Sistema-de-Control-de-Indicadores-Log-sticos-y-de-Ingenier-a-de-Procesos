'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { ClipboardList, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';

interface ProductionRecord {
  id: string;
  productionDate: string | Date;
  batchNumber?: string;
  quantityProduced: number;
  quantityDefective: number;
  hoursOperated: number | string;
  downtimeHours?: number | string;
  setupTime?: number | string;
  notes?: string;
  machine?: { name: string; code: string };
  product?: { name: string; sku: string };
  operator?: { fullName: string };
}

interface ProductionRecordsTableProps {
  records: ProductionRecord[] | any[];
  onEdit?: (record: ProductionRecord) => void;
}

const ITEMS_PER_PAGE = 10;

export function ProductionRecordsTable({ records, onEdit }: ProductionRecordsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();

  const deleteRecord = trpc.inventory.deleteProductionRecord.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Registro eliminado', text: 'El registro se eliminó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getProductionRecords.invalidate();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo eliminar el registro.', confirmButtonColor: '#4F46E5' });
    },
  });

  const handleDelete = (record: ProductionRecord) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && record.id) {
        deleteRecord.mutate({ id: record.id });
      }
    });
  };

  if (!records || records.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
          <ClipboardList className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Registros de Producción</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
          <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay registros de producción</p>
          <p className="text-gray-400 text-xs mt-1">Registra la producción diaria de tus máquinas</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const qualityRate = (produced: number, defective: number) => {
    if (!produced) return 0;
    return (((produced - defective) / produced) * 100).toFixed(1);
  };

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <ClipboardList className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Registros de Producción</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 px-2 py-0.5 rounded-full">
          {records.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Fecha / Lote</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Máquina</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Producto</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Producido</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Defectuoso</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Calidad</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Horas</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-900 dark:text-dark-tremor-content-strong font-medium">
                    {new Date(record.productionDate).toLocaleDateString('es-CO')}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{record.batchNumber || '-'}</div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-dark-tremor-content text-xs">
                  <div className="font-medium">{record.machine?.name || '-'}</div>
                  <div className="text-gray-400">{record.machine?.code || ''}</div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-dark-tremor-content text-xs">
                  <div className="font-medium">{record.product?.name || '-'}</div>
                  <div className="text-gray-400">{record.product?.sku || ''}</div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-dark-tremor-content-strong font-semibold text-xs">
                  {record.quantityProduced?.toLocaleString('en-US')}
                </td>
                <td className="px-4 py-3 text-right text-red-600 font-semibold text-xs">
                  {record.quantityDefective?.toLocaleString('en-US')}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-xs font-bold ${Number(qualityRate(record.quantityProduced, record.quantityDefective)) >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {qualityRate(record.quantityProduced, record.quantityDefective)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-dark-tremor-content">
                  <div>{Number(record.hoursOperated || 0).toFixed(1)}h</div>
                  {Number(record.downtimeHours || 0) > 0 && (
                    <div className="text-red-400 text-[10px]">-{Number(record.downtimeHours).toFixed(1)}h</div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onEdit?.(record)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(record)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-dark-tremor-border bg-gray-50/50 dark:bg-dark-tremor-background-muted">
          <span className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, records.length)} de {records.length}
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
