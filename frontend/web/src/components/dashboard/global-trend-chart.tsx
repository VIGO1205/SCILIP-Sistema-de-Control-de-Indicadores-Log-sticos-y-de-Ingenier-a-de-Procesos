'use client';

import React, { useMemo } from 'react';
import { Card, Text } from '@tremor/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { cn, formatNumber } from '@/lib/utils';

interface GlobalTrendChartProps {
  series: {
    name: string;
    color: string;
    data: { date: string; value: number; target?: number }[];
  }[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs">
      <p className="font-bold text-gray-900 mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}</span>
            </div>
            <span className="font-bold" style={{ color: entry.color }}>
              {typeof entry.value === 'number'
                ? formatNumber(entry.value, 1)
                : entry.value}
              {entry.name.includes('Meta') ? '' : '%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function GlobalTrendChart({
  series,
  loading,
}: GlobalTrendChartProps) {
  const mergedData = useMemo(() => {
    if (series.length === 0) return [];
    const dateMap = new Map<string, any>();
    series.forEach((s) => {
      s.data.forEach((d) => {
        if (!dateMap.has(d.date)) {
          dateMap.set(d.date, { date: d.date });
        }
        const entry = dateMap.get(d.date);
        entry[s.name] = d.value;
        if (d.target !== undefined) {
          entry[`${s.name}_target`] = d.target;
        }
      });
    });
    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [series]);

  if (loading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">
          Tendencia de Indicadores Clave
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Evolución mensual con línea de meta
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mergedData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.name}
                  id={`gradient-${s.name.replace(/\s/g, '')}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={s.color}
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor={s.color}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return d.toLocaleDateString('es-ES', { month: 'short' });
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={30}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
            />
            {series.map((s) => (
              <React.Fragment key={s.name}>
                <Area
                  type="monotone"
                  dataKey={s.name}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#gradient-${s.name.replace(/\s/g, '')})`}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
                {s.data.some((d) => d.target !== undefined) && (
                  <ReferenceLine
                    y={
                      s.data.find((d) => d.target !== undefined)?.target ?? 0
                    }
                    stroke={s.color}
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                  />
                )}
              </React.Fragment>
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
