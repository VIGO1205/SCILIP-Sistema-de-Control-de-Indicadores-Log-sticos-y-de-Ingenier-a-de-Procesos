'use client';

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '../lib/trpc/react';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: unreadData, refetch: refetchUnread } = trpc.notification.unreadCount.useQuery();

  useEffect(() => {
    if (unreadData) setUnreadCount(unreadData.count);
  }, [unreadData]);

  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetchUnread(),
  });

  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      setUnreadCount(0);
      refetchUnread();
    },
  });

  const deleteNotification = trpc.notification.delete.useMutation({
    onSuccess: () => refetchUnread(),
  });

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
  };
}
