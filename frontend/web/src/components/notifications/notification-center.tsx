'use client';

import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Clock, ShoppingCart, AlertTriangle, Package, FileText, Settings } from 'lucide-react';
import { trpc } from '../../lib/trpc/react';
import { useNotifications } from '../../hooks/use-notifications';
import { clsx } from 'clsx';

const typeIcons: Record<string, any> = {
  KPI_ALERT: AlertTriangle,
  PURCHASE_ORDER: ShoppingCart,
  INVENTORY: Package,
  REPORT: FileText,
  SYSTEM: Settings,
};

const typeColors: Record<string, string> = {
  KPI_ALERT: 'bg-red-50 text-red-600',
  PURCHASE_ORDER: 'bg-blue-50 text-blue-600',
  INVENTORY: 'bg-amber-50 text-amber-600',
  REPORT: 'bg-purple-50 text-purple-600',
  SYSTEM: 'bg-gray-50 dark:bg-dark-tremor-background-subtle text-gray-600 dark:text-dark-tremor-content',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'ahora mismo';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { data, refetch } = trpc.notification.list.useQuery({ page: 1, limit: 10 });

  const notifications = data?.notifications || [];

  const handleOpen = () => {
    setOpen(!open);
    if (!open) refetch();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="p-2 text-gray-400 dark:text-dark-tremor-content-subtle hover:text-primary hover:bg-primary/5 rounded-lg transition-all relative"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-danger text-[9px] font-bold text-white border border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-tremor-background rounded-xl shadow-2xl border border-gray-200 dark:border-dark-tremor-border z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-tremor-border">
              <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Marcar todas leídas
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 dark:text-dark-tremor-content-subtle hover:text-gray-600 dark:hover:text-dark-tremor-content">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-dark-tremor-content-subtle">No hay notificaciones</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Bell;
                  const colorClass = typeColors[n.type] || 'bg-gray-50 dark:bg-dark-tremor-background-subtle text-gray-600 dark:text-dark-tremor-content';
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={clsx(
                        'flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-dark-tremor-background-subtle',
                        !n.isRead && 'bg-indigo-50/30'
                      )}
                    >
                      <div className={clsx('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={clsx('text-xs leading-tight', !n.isRead ? 'font-bold text-gray-900 dark:text-dark-tremor-content-strong' : 'font-medium text-gray-700 dark:text-dark-tremor-content')}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-dark-tremor-content-subtle mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400 dark:text-dark-tremor-content-subtle" />
                          <span className="text-[10px] text-gray-400 dark:text-dark-tremor-content-subtle">{timeAgo(new Date(n.createdAt))}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-dark-tremor-border px-4 py-2">
              <a
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
              >
                Ver todas las notificaciones
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
