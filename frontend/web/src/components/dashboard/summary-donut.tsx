'use client';

import React from 'react';
import { Card, Text } from '@tremor/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface SummaryDonutProps {
  good: number;
  warning: number;
  bad: number;
  neutral: number;
  loading?: boolean;
}

const COLORS = {
  good: '#10B981',
  warning: '#F59E0B',
  bad: '#EF4444',
  neutral: '#6B7280',
};

const LABELS = {
  good: 'Óptimos',
  warning: 'En Alerta',
  bad: 'Críticos',
  neutral: 'Sin Meta',
};

const ICONS = {
  good: CheckCircle2,
  warning: AlertTriangle,
  bad: XCircle,
  neutral: CheckCircle2,
};

export default function SummaryDonut({
  good,
  warning,
  bad,
  neutral,
  loading,
}: SummaryDonutProps) {
  const total = good + warning + bad + neutral;
  const performancePercent =
    total > 0 ? Math.round(((good + warning * 0.5) / total) * 100) : 0;

  const data = [
    { name: LABELS.good, value: good, color: COLORS.good },
    { name: LABELS.warning, value: warning, color: COLORS.warning },
    { name: LABELS.bad, value: bad, color: COLORS.bad },
    { name: LABELS.neutral, value: neutral, color: COLORS.neutral },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <div className="animate-pulse flex flex-col items-center py-6">
          <div className="h-32 w-32 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-4" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">
          Estado General de KPIs
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Distribución por cumplimiento
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative h-36 w-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={48}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Label
                value={`${performancePercent}%`}
                position="center"
                className="text-2xl font-bold fill-gray-900"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                }}
                formatter={(value: number, name: string) => [
                  `${value} KPIs`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
              Desempeño Global
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {(
            [
              { key: 'good', count: good },
              { key: 'warning', count: warning },
              { key: 'bad', count: bad },
              { key: 'neutral', count: neutral },
            ] as const
          ).map(({ key, count }) => {
            const Icon = ICONS[key];
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-2.5">
                <div
                  className="h-6 w-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS[key]}15` }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: COLORS[key] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-700">
                      {LABELS[key]}
                    </span>
                    <span className="text-[11px] font-bold text-gray-900">
                      {count}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: COLORS[key],
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
