'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Card, Title, Text } from '@tremor/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logging/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <Title className="text-2xl mb-2">Algo salió mal</Title>
              <Text className="text-gray-600 mb-6">
                {this.state.error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta recargar la página.'}
              </Text>
              <div className="flex gap-3 justify-center">
                <Button
                  icon={RefreshCw}
                  onClick={() => window.location.reload()}
                  color="blue"
                >
                  Recargar página
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => this.setState({ hasError: false, error: null })}
                >
                  Intentar de nuevo
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                    Detalles técnicos (desarrollo)
                  </summary>
                  <pre className="text-xs text-red-600 bg-red-50 p-4 rounded overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
