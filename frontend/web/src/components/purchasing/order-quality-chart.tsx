'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@tremor/react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface OrderQualityChartProps {
  quality?: number;
  target?: number;
  loading?: boolean;
}

export function OrderQualityChart({ quality = 0, target = 90, loading = false }: OrderQualityChartProps) {
  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl p-6">
        <div className="h-72 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-gray-200 rounded-full mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  const data = [
    { name: 'Actual', value: quality, fill: quality >= target ? '#10B981' : quality >= target * 0.85 ? '#F59E0B' : '#EF4444' },
    { name: 'Meta', value: target, fill: '#E5E7EB' },
  ];

  const status = quality >= target ? 'good' : quality >= target * 0.85 ? 'warning' : 'bad';
  const statusConfig = {
    good: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Óptimo' },
    warning: { icon: Minus, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Atención' },
    bad: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Crítico' },
  };
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm rounded-xl">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border px-5 pt-5">
        <BarChart3 className="h-4 w-4 text-gray-400 dark:text-dark-tremor-content-subtle" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">Calidad de los Pedidos Generados</h3>
        <span className="ml-auto text-[10px] font-medium text-gray-400 dark:text-dark-tremor-content-subtle bg-gray-100 dark:bg-dark-tremor-background-muted px-2 py-0.5 rounded">
          NOR_DIS_IND_02
        </span>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${config.bg} border ${config.border}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
            <div>
              <p className={`text-xs font-medium ${config.color}`}>{config.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-dark-tremor-content-strong">{quality.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-dark-tremor-content-subtle mb-1">
              <span>Progreso hacia meta</span>
              <span>{target}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-dark-tremor-background-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  status === 'good' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((quality / target) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Calidad']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', backgroundColor: '#ffffff', color: '#374151' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
