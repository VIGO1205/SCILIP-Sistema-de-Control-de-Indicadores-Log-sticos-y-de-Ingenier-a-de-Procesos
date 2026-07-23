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
    <div className="bg-white dark:bg-dark-tremor-background p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-tremor-border text-xs">
      <p className="font-bold text-gray-900 dark:text-dark-tremor-content-strong mb-1">{data.name}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500 dark:text-dark-tremor-content-subtle">Cumplimiento:</span>
          <span className="font-bold" style={{ color: getBarColor(data.compliance) }}>
            {formatNumber(data.compliance, 1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500 dark:text-dark-tremor-content-subtle">Óptimos:</span>
          <span className="font-semibold text-success">{data.good}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500 dark:text-dark-tremor-content-subtle">Alertas:</span>
          <span className="font-semibold text-warning">{data.warning}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500 dark:text-dark-tremor-content-subtle">Críticos:</span>
          <span className="font-semibold text-danger">{data.bad}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100 dark:border-dark-tremor-border">
          <span className="text-gray-500 dark:text-dark-tremor-content-subtle">Total KPIs:</span>
          <span className="font-bold text-gray-900 dark:text-dark-tremor-content-strong">{data.totalKpis}</span>
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
      <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm">
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
    <Card className="border border-gray-200 dark:border-dark-tremor-border shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-dark-tremor-border">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-tremor-content-strong">
            Cumplimiento por Categoría
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-dark-tremor-content-subtle mt-0.5">
            % de indicadores dentro de meta por área
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-dark-tremor-background-subtle rounded-lg border border-gray-200 dark:border-dark-tremor-border">
          <span className="text-[10px] font-medium text-gray-500 dark:text-dark-tremor-content-subtle">Global:</span>
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

      {/* Animated Truck Section */}
      <div className="mt-3 relative h-20 overflow-hidden">
        {/* Road */}
        <div className="absolute bottom-0 w-full h-4 bg-gray-800 rounded-t-full">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-400"
               style={{ backgroundImage: 'repeating-linear-gradient(90deg, #facc15 0px, #facc15 20px, transparent 20px, transparent 40px)' }} />
        </div>
        
        {/* Warehouse on the right */}
        <div className="absolute bottom-4 right-8 flex flex-col items-center">
          <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-t-lg flex items-center justify-center">
            <div className="w-12 h-12 bg-amber-800 dark:bg-amber-900 rounded-t-lg" />
          </div>
          <div className="w-24 h-2 bg-gray-400 dark:bg-gray-600 rounded" />
          <Package className="h-4 w-4 text-blue-500 mt-1" />
        </div>
        
        {/* Animated Truck */}
        <div className="absolute bottom-4 left-0 animate-truck-drive">
          <div className="flex flex-col items-center">
            <Truck className="h-12 w-16 text-orange-500" />
            <div className="flex gap-3 -mt-1">
              <div className="w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600" />
              <div className="w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600" />
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes truck-drive {
          0% { transform: translateX(-100px); }
          70% { transform: translateX(calc(100vw - 200px)); }
          85% { transform: translateX(calc(100vw - 180px)); }
          100% { transform: translateX(-100px); }
        }
        .animate-truck-drive {
          animation: truck-drive 8s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
}
