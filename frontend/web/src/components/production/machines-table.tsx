'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { Factory, Settings, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';

interface Machine {
  id: string;
  code: string;
  name: string;
  type?: string;
  brand?: string;
  model?: string;
  maxCapacity?: number | string;
  capacityUnit?: string;
  efficiencyRate?: number | string;
  status?: string;
  lastMaintenance?: string | Date;
  nextMaintenance?: string | Date;
}

interface MachinesTableProps {
  machines: Machine[] | any[];
  onEdit?: (machine: Machine) => void;
}

const ITEMS_PER_PAGE = 10;

const statusMap: Record<string, { label: string; class: string }> = {
  operational: { label: 'Operativa', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  maintenance: { label: 'Mantenimiento', class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  breakdown: { label: 'Avería', class: 'bg-red-50 text-red-700 border border-red-200' },
  inactive: { label: 'Inactiva', class: 'bg-gray-50 text-gray-700 border border-gray-200' },
};

export function MachinesTable({ machines, onEdit }: MachinesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();

  const deleteMachine = trpc.inventory.deleteMachine.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Máquina eliminada', text: 'La máquina se eliminó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.inventory.getMachines.invalidate();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo eliminar la máquina.', confirmButtonColor: '#4F46E5' });
    },
  });

  const handleDelete = (machine: Machine) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar máquina?',
      text: `Estás seguro de eliminar "${machine.name}" (${machine.code})?`,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && machine.id) {
        deleteMachine.mutate({ id: machine.id });
      }
    });
  };

  if (!machines || machines.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
          <Factory className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900">Máquinas y Equipos</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 rounded-lg border border-dashed border-gray-200">
          <Factory className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No hay máquinas registradas</p>
          <p className="text-gray-400 text-xs mt-1">Registra máquinas para monitorear su rendimiento</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(machines.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = machines.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
        <Factory className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900">Máquinas y Equipos</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {machines.length} máquinas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Máquina</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo / Marca</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacidad</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Eficiencia</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((machine) => {
              const status = statusMap[machine.status || ''] || statusMap.inactive;
              return (
                <tr key={machine.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block">{machine.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{machine.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <div>{machine.type || '-'}</div>
                    <div className="text-gray-400">{machine.brand} {machine.model}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold text-xs">
                    {machine.maxCapacity ? Number(machine.maxCapacity).toLocaleString('en-US') : '-'} <span className="text-gray-400">{machine.capacityUnit || ''}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">{Number(machine.efficiencyRate || 0)}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit?.(machine)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(machine)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, machines.length)} de {machines.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${page === currentPage ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
