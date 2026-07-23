'use client';

import React from 'react';
import { Metric, Text } from '@tremor/react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Area, AreaChart, ResponsiveContainer, ReferenceLine } from 'recharts';

interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  target?: number;
  previousValue?: number;
  status?: 'good' | 'bad' | 'neutral' | 'warning';
  direction?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: any;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  sparklineData?: { value: number; target?: number }[];
}

function computeStatus(
  value: number,
  target: number | undefined,
  direction: 'up' | 'down'
): 'good' | 'bad' | 'warning' | 'neutral' {
  if (!target || target === 0) return 'neutral';
  const ratio = value / target;
  if (direction === 'up') {
    if (ratio >= 1) return 'good';
    if (ratio >= 0.85) return 'warning';
    return 'bad';
  }
  if (ratio <= 1) return 'good';
  if (ratio <= 1.15) return 'warning';
  return 'bad';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  target,
  previousValue,
  status: forcedStatus,
  direction = 'up',
  icon,
  color = 'blue',
  loading = false,
  onClick,
  className,
  subtitle,
  trend,
  trendLabel = 'vs anterior',
  sparklineData,
}) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const computedStatus =
    forcedStatus ??
    (target ? computeStatus(numericValue, target, direction) : 'neutral');
  const status = computedStatus;

  const computedTrend =
    trend ??
    (typeof previousValue === 'number' && previousValue !== 0
      ? ((numericValue - previousValue) / previousValue) * 100
      : 0);

  const progressPercent =
    target && target > 0
      ? (numericValue / target) * 100
      : null;

  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-success bg-success/10 border-success/20';
      case 'bad':
        return 'text-danger bg-danger/10 border-danger/20';
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getStatusChartColor = () => {
    switch (status) {
      case 'good':
        return '#10B981';
      case 'bad':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#4F46E5';
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'good':
        return 'bg-success';
      case 'bad':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  };

  const getTrendColor = () => {
    if (computedTrend > 0)
      return direction === 'up' ? 'text-success' : 'text-danger';
    if (computedTrend < 0)
      return direction === 'down' ? 'text-success' : 'text-danger';
    return 'text-gray-500';
  };

  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    // Formato personalizado: coma para miles, punto para decimales
    const fmt = (n: number, digits: number) =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(n);
    if (unit === '%') return `${fmt(val, 1)}%`;
    if (unit === 'currency' || unit === 'COP') return `$ ${fmt(val, 0)}`;
    if (unit === 'times') return `${fmt(val, 2)}x`;
    if (unit === 'days') return `${fmt(val, 1)} días`;
    if (unit === 'units') return fmt(val, 0);
    return fmt(val, 1);
  };

  return (
    <div
      className={cn(
        'relative bg-white p-5 rounded-xl border border-gray-200 shadow-kpi hover:shadow-kpi-hover transition-all duration-300 group',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col min-w-0 flex-1">
          <Text style={{ color: '#6B7280' }} className="text-xs font-semibold uppercase tracking-wide leading-none mb-1 truncate">
            {title}
          </Text>
          {subtitle && (
            <Text style={{ color: '#9CA3AF' }} className="text-[10px] font-medium">
              {subtitle}
            </Text>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg border flex-shrink-0 transition-colors',
              getStatusColor()
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mb-3">
        <div className="flex flex-col">
          <Metric
            style={{ color: '#111827' }}
            className={cn(
              'text-2xl font-bold',
              loading && 'animate-pulse'
            )}
          >
            {loading ? '---' : formatValue(value)}
          </Metric>
          {target !== undefined && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-medium text-gray-400">
                Meta:
              </span>
              <span className="text-[11px] font-semibold text-gray-600">
                {formatValue(target)}
              </span>
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient
                    id={`gradient-${title.replace(/\s/g, '')}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={getStatusChartColor()}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={getStatusChartColor()}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                {target !== undefined && (
                  <ReferenceLine
                    y={target}
                    stroke="#9CA3AF"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={getStatusChartColor()}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {progressPercent !== null && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-gray-400">
              Progreso vs meta
            </span>
            <span className="text-[10px] font-bold text-gray-600">
              {progressPercent.toFixed(2)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
                getProgressBarColor()
              )}
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className={cn('flex items-center text-xs font-semibold', getTrendColor())}>
          {computedTrend > 0 ? (
            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
          ) : computedTrend < 0 ? (
            <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
          ) : (
            <Minus className="h-3.5 w-3.5 mr-0.5" />
          )}
          {Math.abs(computedTrend).toFixed(1)}%
        </div>
        <span className="text-[10px] font-medium text-gray-400">
          {trendLabel}
        </span>
        <div
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
            status === 'good' && 'bg-success/10 text-success',
            status === 'bad' && 'bg-danger/10 text-danger',
            status === 'warning' && 'bg-amber-50 text-amber-700',
            status === 'neutral' && 'bg-primary/10 text-primary'
          )}
        >
          {status === 'good'
            ? 'Óptimo'
            : status === 'bad'
            ? 'Crítico'
            : status === 'warning'
            ? 'Alerta'
            : 'Neutro'}
        </div>
      </div>
    </div>
  );
};
