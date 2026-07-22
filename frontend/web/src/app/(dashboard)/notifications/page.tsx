'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  ShoppingCart,
  AlertTriangle,
  Package,
  FileText,
  Settings,
  Trash2,
  Inbox,
} from 'lucide-react';
import { trpc } from '../../../lib/trpc/react';
import { useNotifications } from '../../../hooks/use-notifications';
import { Card, Divider } from '@tremor/react';
import { clsx } from 'clsx';

const typeIcons: Record<string, any> = {
  KPI_ALERT: AlertTriangle,
  PURCHASE_ORDER: ShoppingCart,
  INVENTORY: Package,
  REPORT: FileText,
  SYSTEM: Settings,
};

const typeColors: Record<string, string> = {
  KPI_ALERT: 'bg-red-50 text-red-600 border-red-200',
  PURCHASE_ORDER: 'bg-blue-50 text-blue-600 border-blue-200',
  INVENTORY: 'bg-amber-50 text-amber-600 border-amber-200',
  REPORT: 'bg-purple-50 text-purple-600 border-purple-200',
  SYSTEM: 'bg-gray-50 text-gray-600 border-gray-200',
};

const typeLabels: Record<string, string> = {
  KPI_ALERT: 'Alerta KPI',
  PURCHASE_ORDER: 'Orden de Compra',
  INVENTORY: 'Inventario',
  REPORT: 'Reporte',
  SYSTEM: 'Sistema',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'ahora mismo';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(date).toLocaleDateString('es-CO');
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { markAsRead, markAllAsRead, deleteNotification, registerListRefetch } = useNotifications();
  const { data, refetch } = trpc.notification.list.useQuery({ page, limit: 20 });

  // Registrar el refetch de la lista en el hook global para que se llame tras mark/delete
  useEffect(() => {
    registerListRefetch(refetch);
  }, [registerListRefetch, refetch]);

  const notifications = data?.notifications || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <main className="p-4 sm:p-5 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-gray-500 mt-0.5 text-xs">
              {total} notificaciones en total
            </p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas leídas
          </button>
        </div>
        <Divider className="mt-4" />
      </div>

      {notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 border border-gray-200">
          <Inbox className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm font-bold text-gray-900">No hay notificaciones</p>
          <p className="text-xs text-gray-500 mt-1">Cuando haya actividad en el sistema, aparecerán aquí.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            const colorClass = typeColors[n.type] || 'bg-gray-50 text-gray-600 border-gray-200';
            return (
              <Card
                key={n.id}
                className={clsx(
                  'flex items-start gap-4 p-4 transition-all hover:shadow-md',
                  !n.isRead && 'border-l-4 border-l-indigo-500 bg-indigo-50/20'
                )}
              >
                <div className={clsx('h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border', colorClass)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={clsx('text-sm', !n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700')}>
                          {n.title}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                          {typeLabels[n.type] || n.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-[11px] text-gray-400">{timeAgo(new Date(n.createdAt))}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Marcar como leída"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </main>
  );
}
