'use client';

import React from 'react';
import { Card, Text, Badge } from '@tremor/react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface AlertItem {
  kpiCode: string;
  kpiName: string;
  category: string;
  actualValue: number;
  targetValue: number;
  unit: string;
  status: 'bad' | 'warning';
  direction: 'up' | 'down';
}

interface AlertsPanelProps {
  alerts: AlertItem[];
  loading?: boolean;
}

function computeDeviation(
  actual: number,
  target: number,
  direction: 'up' | 'down'
): number {
  if (target === 0) return 0;
  if (direction === 'down') {
    return ((actual - target) / target) * 100;
  }
  return ((target - actual) / target) * 100;
}

function formatKpiValue(value: number, unit: string): string {
  if (unit === '%') return `${formatNumber(value, 1)}%`;
  if (unit === 'currency' || unit === 'COP') return `$ ${formatNumber(value, 0)}`;
  if (unit === 'times') return `${formatNumber(value, 2)}x`;
  if (unit === 'days') return `${formatNumber(value, 1)} días`;
  return formatNumber(value, 1);
}

export default function AlertsPanel({ alerts, loading }: AlertsPanelProps) {
  const criticalAlerts = alerts.filter((a) => a.status === 'bad');
  const warningAlerts = alerts.filter((a) => a.status === 'warning');

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm bg-white dark:bg-dark-tremor-background transition-colors">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-dark-tremor-background-subtle rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-dark-tremor-background-subtle rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm bg-white dark:bg-dark-tremor-background transition-colors">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-danger/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">
              Alertas Activas
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-dark-tremor-content-subtle">
              Indicadores fuera de rango
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalAlerts.length > 0 && (
            <span className="px-2 py-0.5 bg-danger/10 text-danger text-[10px] font-bold rounded-full">
              {criticalAlerts.length} críticas
            </span>
          )}
          {warningAlerts.length > 0 && (
            <span className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] font-bold rounded-full">
              {warningAlerts.length} alertas
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-dark-tremor-content">
            Todo bajo control
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-tremor-content-subtle mt-1">
            Todos los indicadores dentro de rango
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {criticalAlerts.map((alert) => {
            const deviation = computeDeviation(
              alert.actualValue,
              alert.targetValue,
              alert.direction
            );
            return (
              <div
                key={alert.kpiCode}
                className="flex items-center gap-3 p-3 bg-danger/5 rounded-lg border border-danger/10 hover:bg-danger/10 transition-colors group"
              >
                <div className="h-8 w-8 bg-danger/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-danger" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-dark-tremor-content-strong truncate">
                    {alert.kpiName}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-dark-tremor-content-subtle mt-0.5">
                    {alert.category}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-danger">
                    {formatKpiValue(alert.actualValue, alert.unit)}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-dark-tremor-content-subtle">
                    Meta: {formatKpiValue(alert.targetValue, alert.unit)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-1.5 py-0.5 bg-danger/10 text-danger text-[9px] font-bold rounded">
                    {deviation > 0 ? '-' : '+'}
                    {formatNumber(Math.abs(deviation), 0)}%
                  </span>
                </div>
              </div>
            );
          })}

          {warningAlerts.map((alert) => {
            const deviation = computeDeviation(
              alert.actualValue,
              alert.targetValue,
              alert.direction
            );
            return (
              <div
                key={alert.kpiCode}
                className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg border border-warning/10 hover:bg-warning/10 transition-colors"
              >
                <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {alert.kpiName}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {alert.category}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-warning">
                    {formatKpiValue(alert.actualValue, alert.unit)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Meta: {formatKpiValue(alert.targetValue, alert.unit)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-1.5 py-0.5 bg-warning/10 text-warning text-[9px] font-bold rounded">
                    {deviation > 0 ? '-' : '+'}
                    {formatNumber(Math.abs(deviation), 0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
