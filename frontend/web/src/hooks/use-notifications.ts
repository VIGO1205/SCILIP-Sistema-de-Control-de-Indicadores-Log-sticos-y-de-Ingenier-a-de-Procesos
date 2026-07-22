'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '../lib/trpc/react';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  // Ref para almacenar funciones de refetch de la lista (se registran desde la página)
  const listRefetchRef = useRef<(() => void) | null>(null);

  const { data: unreadData, refetch: refetchUnread } = trpc.notification.unreadCount.useQuery();

  useEffect(() => {
    if (unreadData) setUnreadCount(unreadData.count);
  }, [unreadData]);

  const refetchAll = useCallback(() => {
    refetchUnread();
    listRefetchRef.current?.();
  }, [refetchUnread]);

  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetchAll(),
  });

  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      setUnreadCount(0);
      refetchAll();
    },
  });

  const deleteNotification = trpc.notification.delete.useMutation({
    onSuccess: () => refetchAll(),
  });

  // Poll cada 30 segundos para mantener contador actualizado
  useEffect(() => {
    const interval = setInterval(() => {
      refetchUnread();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchUnread]);

  return {
    unreadCount,
    markAsRead: useCallback((id: string) => markAsRead.mutate({ id }), [markAsRead]),
    markAllAsRead: useCallback(() => markAllAsRead.mutate(), [markAllAsRead]),
    deleteNotification: useCallback((id: string) => deleteNotification.mutate({ id }), [deleteNotification]),
    refetch: refetchUnread,
    /** Registrar el refetch de la lista desde la página de notificaciones */
    registerListRefetch: useCallback((fn: () => void) => {
      listRefetchRef.current = fn;
    }, []),
  };
}
