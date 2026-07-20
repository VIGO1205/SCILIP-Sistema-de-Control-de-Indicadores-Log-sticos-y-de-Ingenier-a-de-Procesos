'use client';

import React, { useMemo } from 'react';
import { Card, Text } from '@tremor/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  ShoppingCart,
  Package,
  Truck,
  Users,
  Globe,
  Factory,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface CategoryBarChartProps {
  categoryData: {
    code: string;
    name: string;
    compliance: number;
    totalKpis: number;
    good: number;
    warning: number;
    bad: number;
  }[];
  loading?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  CAT_3_1: ShoppingCart,
  CAT_3_2: Factory,
  CAT_3_3: Package,
  CAT_3_4: Truck,
  CAT_3_5: Users,
  CAT_3_6: Globe,
};

const CATEGORY_COLORS: Record<string, string> = {
  CAT_3_1: '#4F46E5',
  CAT_3_2: '#7C3AED',
  CAT_3_3: '#059669',
  CAT_3_4: '#D97706',
  CAT_3_5: '#DC2626',
  CAT_3_6: '#0891B2',
};

function getBarColor(compliance: number): string {
  if (compliance >= 80) return '#10B981';
  if (compliance >= 60) return '#F59E0B';
  return '#EF4444';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs">
      <p className="font-bold text-gray-900 mb-1">{data.name}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Cumplimiento:</span>
          <span className="font-bold" style={{ color: getBarColor(data.compliance) }}>
            {formatNumber(data.compliance, 1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Óptimos:</span>
          <span className="font-semibold text-success">{data.good}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Alertas:</span>
          <span className="font-semibold text-warning">{data.warning}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Críticos:</span>
          <span className="font-semibold text-danger">{data.bad}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
          <span className="text-gray-500">Total KPIs:</span>
          <span className="font-bold text-gray-900">{data.totalKpis}</span>
        </div>
      </div>
    </div>
  );
};

export default function CategoryBarChart({
  categoryData,
  loading,
}: CategoryBarChartProps) {
  const chartData = useMemo(
    () =>
      categoryData.map((cat) => ({
        ...cat,
        shortName:
          cat.name.length > 15 ? cat.name.substring(0, 12) + '...' : cat.name,
      })),
    [categoryData]
  );

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

  const overallAvg =
    chartData.length > 0
      ? chartData.reduce((sum, c) => sum + c.compliance, 0) / chartData.length
      : 0;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Cumplimiento por Categoría
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            % de indicadores dentro de meta por área
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-[10px] font-medium text-gray-500">Global:</span>
          <span
            className={cn(
              'text-xs font-bold',
              overallAvg >= 80
                ? 'text-success'
                : overallAvg >= 60
                ? 'text-warning'
                : 'text-danger'
            )}
          >
            {formatNumber(overallAvg, 1)}%
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barSize={40}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="shortName"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <ReferenceLine
              y={80}
              stroke="#10B981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Meta 80%',
                position: 'right',
                fill: '#10B981',
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            <Bar dataKey="compliance" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.compliance)}
                />
              ))}
              <LabelList
                dataKey="compliance"
                position="top"
                formatter={(v: number) => `${formatNumber(v, 0)}%`}
                style={{ fill: '#374151', fontSize: 10, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
