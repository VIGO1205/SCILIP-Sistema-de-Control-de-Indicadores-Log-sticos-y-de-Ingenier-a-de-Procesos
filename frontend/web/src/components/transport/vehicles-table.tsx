'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { Truck, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';

interface Vehicle {
  id: string;
  plateNumber: string;
  brand?: string;
  model?: string;
  year?: number;
  vehicleType?: string;
  maxWeightKg?: number | string;
  maxVolumeM3?: number | string;
  fuelType?: string;
  status?: string;
  isOwnVehicle?: boolean;
}

interface VehiclesTableProps {
  vehicles: Vehicle[] | any[];
  onEdit?: (vehicle: Vehicle) => void;
}

const ITEMS_PER_PAGE = 10;

const statusMap: Record<string, { label: string; class: string }> = {
  active: { label: 'Activo', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  inactive: { label: 'Inactivo', class: 'bg-gray-50 text-gray-700 dark:text-dark-tremor-content border border-gray-200 dark:border-dark-tremor-border' },
  maintenance: { label: 'Mantenimiento', class: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

export function VehiclesTable({ vehicles, onEdit }: VehiclesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();

  const deleteVehicle = trpc.transport.deleteVehicle.useMutation({
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Vehículo eliminado', text: 'El vehículo se eliminó exitosamente.', confirmButtonColor: '#4F46E5', timer: 3000 });
      utils.transport.getVehicles.invalidate();
    },
    onError: (error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo eliminar el vehículo.', confirmButtonColor: '#4F46E5' });
    },
  });

  const handleDelete = (vehicle: Vehicle) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar vehículo?',
      text: `Eliminar "${vehicle.plateNumber}"?`,
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && vehicle.id) {
        deleteVehicle.mutate({ id: vehicle.id });
      }
    });
  };

  if (!vehicles || vehicles.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
          <Truck className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Flota de Vehículos</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 dark:from-dark-tremor-background dark:to-dark-tremor-background-subtle rounded-lg border border-dashed border-gray-200 dark:border-dark-tremor-border">
          <Truck className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-dark-tremor-content-subtle font-medium">No hay vehículos registrados</p>
          <p className="text-gray-400 text-xs mt-1">Registra vehículos para gestionar tu flota</p>
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = vehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <Truck className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Flota de Vehículos</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle bg-gray-100 px-2 py-0.5 rounded-full">
          {vehicles.length} vehículos
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-dark-tremor-background-subtle border-b border-gray-100 dark:border-dark-tremor-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Vehículo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Marca / Modelo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Tipo</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Capacidad</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-dark-tremor-content-subtle uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((vehicle) => {
              const status = statusMap[vehicle.status || ''] || statusMap.inactive;
              return (
                <tr key={vehicle.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tremor-background-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-dark-tremor-content-strong block">{vehicle.plateNumber}</span>
                        <span className="text-[10px] text-gray-400">{vehicle.fuelType || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-dark-tremor-content text-xs">
                    <div className="font-medium">{vehicle.brand || '-'}</div>
                    <div className="text-gray-400">{vehicle.model || ''} {vehicle.year ? `(${vehicle.year})` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-dark-tremor-content">
                    {vehicle.vehicleType || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-600 dark:text-dark-tremor-content">
                    <div>{vehicle.maxWeightKg ? Number(vehicle.maxWeightKg).toLocaleString('en-US') + ' kg' : '-'}</div>
                    <div className="text-gray-400">{vehicle.maxVolumeM3 ? Number(vehicle.maxVolumeM3).toLocaleString('en-US') + ' m³' : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit?.(vehicle)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(vehicle)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
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
            Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, vehicles.length)} de {vehicles.length}
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
