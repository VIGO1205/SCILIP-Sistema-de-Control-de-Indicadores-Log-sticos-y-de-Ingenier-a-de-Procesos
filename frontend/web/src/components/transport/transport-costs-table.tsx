'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { DollarSign, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';

interface TransportCost {
  id: string;
  costDate: string | Date;
  costType: string;
  amount: number | string;
  quantityLiters?: number | string;
  distanceKm?: number | string;
  hoursDriven?: number | string;
  invoiceNumber?: string;
  notes?: string;
  vehicle?: { plateNumber: string; brand?: string };
  driver?: { employee?: { fullName?: string } };
}

interface TransportCostsTableProps {
  costs: TransportCost[] | any[];
  onEdit?: (cost: TransportCost) => void;
}

const ITEMS_PER_PAGE = 10;

const costTypeMap: Record<string, string> = {
  FUEL: 'Combustible',
  MAINTENANCE: 'Mantenimiento',
  TOLL: 'Peajes',
  SALARY: 'Salario Conductor',
  INSURANCE: 'Seguros',
  OTHER: 'Otros',
};

const costTypeColor: Record<string, string> = {
  FUEL: 'bg-orange-50 text-orange-700 border border-orange-200',
  MAINTENANCE: 'bg-blue-50 text-blue-700 border border-blue-200',
  TOLL: 'bg-purple-50 text-purple-700 border border-purple-200',
  SALARY: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  INSURANCE: 'bg-gray-50 text-gray-700 dark:text-dark-tremor-content border border-gray-200 dark:border-dark-tremor-border',
  OTHER: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export function TransportCostsTable({ costs, onEdit }: TransportCostsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();

  const deleteCost = trpc.transport.deleteTransportCost.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Costo eliminado', text: 'El registro se eliminó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.transport.getTransportCosts.invalidate();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo eliminar el registro.', confirmButtonColor: '#4F46E5' });
    },
  });

  const handleDelete = (cost: TransportCost) => {
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
      if (result.isConfirmed && cost.id) {
        deleteCost.mutate({ id: cost.id });
      }
    });
  };

  if (!costs || costs.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Costos de Transporte</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
          <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay costos registrados</p>
          <p className="text-gray-400 text-xs mt-1">Registra gastos de combustible, peajes, mantenimiento, etc.</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(costs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = costs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <DollarSign className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Costos de Transporte</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 px-2 py-0.5 rounded-full">
          {costs.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Vehículo</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Tipo</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Monto</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Detalles</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((cost) => {
              const typeLabel = costTypeMap[cost.costType] || cost.costType;
              const typeClass = costTypeColor[cost.costType] || costTypeColor.OTHER;
              return (
                <tr key={cost.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-900 dark:text-dark-tremor-content-strong">
                    {new Date(cost.costDate).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-dark-tremor-content text-xs">
                    <div className="font-medium">{cost.vehicle?.plateNumber || '-'}</div>
                    <div className="text-gray-400">{cost.vehicle?.brand || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${typeClass}`}>
                      {typeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-dark-tremor-content-strong font-semibold text-xs">
                    $ {Number(cost.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 text-center text-[10px] text-gray-500 dark:text-dark-tremor-content-subtle">
                    {cost.distanceKm && <div>{Number(cost.distanceKm).toFixed(1)} km</div>}
                    {cost.quantityLiters && <div>{Number(cost.quantityLiters).toFixed(1)} L</div>}
                    {cost.hoursDriven && <div>{Number(cost.hoursDriven).toFixed(1)} h</div>}
                    {!cost.distanceKm && !cost.quantityLiters && !cost.hoursDriven && '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit?.(cost)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cost)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
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
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, costs.length)} de {costs.length}
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
