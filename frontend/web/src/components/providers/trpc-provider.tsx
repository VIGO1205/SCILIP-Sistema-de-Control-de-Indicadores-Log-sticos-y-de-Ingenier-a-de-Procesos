'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState, useEffect } from 'react';
import { trpc } from '../../lib/trpc/react';
import { AuthProvider } from './auth-provider';
import { ToastProvider, useToast } from '../notifications/toast-provider';
import { logger } from '../../lib/logging/logger';

function TRPCErrorHandler({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 0,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    (trpc as any).createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          fetch(url, options) {
            return fetch(url, { ...options, credentials: 'include' });
          },
        }),
      ],
    })
  );

  // Inyectar el cliente tRPC en el logger
  useEffect(() => {
    logger.setTRPCClient(trpcClient);
  }, [trpcClient]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <TRPCErrorHandler>
        <AuthProvider>{children}</AuthProvider>
      </TRPCErrorHandler>
    </ToastProvider>
  );
}
