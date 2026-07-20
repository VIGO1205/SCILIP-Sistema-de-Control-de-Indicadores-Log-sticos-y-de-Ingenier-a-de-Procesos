'use client';

import React, { useState } from 'react';
import { Card } from '@tremor/react';
import { FileText, Clock, CheckCircle2, XCircle, AlertTriangle, Trash2, Download, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { trpc } from '@/lib/trpc/react';

interface ReportsHistoryTableProps {
  history: any[];
}

export function ReportsHistoryTable({ history }: ReportsHistoryTableProps) {
  const utils = trpc.useUtils();
  const downloadMutation = trpc.report.downloadReport.useMutation();
  const deleteMutation = trpc.report.deleteHistory.useMutation({
    onSuccess: () => utils.report.getHistory.invalidate(),
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!history || history.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-gray-50/50 rounded-lg border border-dashed border-gray-200">
          <Clock className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No hay reportes generados aún</p>
          <p className="text-gray-400 text-xs mt-1">Los reportes descargados aparecerán aquí</p>
        </div>
      </Card>
    );
  }

  const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
    success: { label: 'Completado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    completed: { label: 'Completado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    failed: { label: 'Error', class: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
    pending: { label: 'En Proceso', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
  };

  const handleReDownload = async (item: any) => {
    let meta: any = {};
    try { meta = JSON.parse(item.fileUrl || '{}'); } catch {}
    if (!meta.type || !meta.format || !meta.year) return;

    setLoadingId(`${item.id}-dl`);
    try {
      const result = await downloadMutation.mutateAsync({
        type: meta.type,
        format: meta.format,
        year: meta.year,
      });

      const byteCharacters = atob(result.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.contentType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      Swal.fire({
        title: 'Error al descargar',
        text: err.message || 'No se pudo descargar el reporte',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar del historial?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });
    if (!result.isConfirmed) return;

    setLoadingId(`${id}-del`);
    try {
      await deleteMutation.mutateAsync({ id });
      Swal.fire({
        title: 'Eliminado',
        text: 'El registro fue eliminado del historial.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'No se pudo eliminar',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 px-5 pt-5">
        <Clock className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900">Historial de Reportes Generados</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {history.length} reportes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reporte</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Formato</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tamaño</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((item) => {
              const status = statusConfig[item.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isDlLoading = loadingId === `${item.id}-dl`;
              const isDelLoading = loadingId === `${item.id}-del`;

              let meta: any = {};
              try { meta = JSON.parse(item.fileUrl || '{}'); } catch {}
              const canReDownload = !!meta.type && !!meta.format && !!meta.year;

              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-gray-900 text-xs">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.format === 'pdf'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.format.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(item.generatedAt).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.class}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-600">
                    {item.fileSizeBytes ? `${(item.fileSizeBytes / 1024).toFixed(1)} KB` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {canReDownload ? (
                        <button
                          onClick={() => handleReDownload(item)}
                          disabled={isDlLoading || isDelLoading}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
                          title="Volver a descargar"
                        >
                          {isDlLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                          Descargar
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed" title="Registro antiguo sin parámetros">
                          <Download className="h-3 w-3" />
                          Descargar
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDlLoading || isDelLoading}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                        title="Eliminar del historial"
                      >
                        {isDelLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Eliminar
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
