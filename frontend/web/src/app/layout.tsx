import React from 'react';
import { Providers } from '../components/providers/trpc-provider';
import { ErrorBoundary } from '../components/error/error-boundary';
import '../styles/globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: 'BI Logístico - ProyectoCD',
  description: 'Panel de control de indicadores logísticos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
