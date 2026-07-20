'use client';

import React, { useMemo, useState } from 'react';
import { Text, Badge } from '@tremor/react';
import {
  ShoppingCart,
  Package,
  Truck,
  Users,
  Globe,
  Factory,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPICard } from '@/components/ui/kpi-card';
import { AiOverlay } from '@/components/ui/ai-interpretation';
import { trpc } from '@/lib/trpc/react';

interface KpiCategoryGridProps {
  startDate: Date;
  endDate: Date;
  selectedClass?: string;
}

const CATEGORY_CONFIG: Record<
  string,
  { name: string; icon: React.ElementType; color: string; bgClass: string }
> = {
  CAT_3_1: {
    name: 'Compras y Abastecimiento',
    icon: ShoppingCart,
    color: '#4F46E5',
    bgClass: 'bg-primary/10 text-primary',
  },
  CAT_3_2: {
    name: 'Inventarios y Producción',
    icon: Factory,
    color: '#7C3AED',
    bgClass: 'bg-purple-100 text-purple-700',
  },
  CAT_3_3: {
    name: 'Almacenamiento y Bodegaje',
    icon: Package,
    color: '#059669',
    bgClass: 'bg-success/10 text-success',
  },
  CAT_3_4: {
    name: 'Transporte y Distribución',
    icon: Truck,
    color: '#D97706',
    bgClass: 'bg-warning/10 text-warning',
  },
  CAT_3_5: {
    name: 'Servicio al Cliente',
    icon: Users,
    color: '#DC2626',
    bgClass: 'bg-danger/10 text-danger',
  },
  CAT_3_6: {
    name: 'Comercio Exterior',
    icon: Globe,
    color: '#0891B2',
    bgClass: 'bg-cyan-100 text-cyan-700',
  },
};

function KpiMiniCard({
  definition,
  data,
  timeSeries,
  loading,
}: {
  definition: any;
  data: any;
  timeSeries: any[];
  loading: boolean;
}) {
  const status = useMemo(() => {
    if (!data || !definition?.targetValue) return 'neutral' as const;
    const val =
      typeof data === 'object'
        ? Object.values(data).find((v) => typeof v === 'number') ?? 0
        : 0;
    const target = Number(definition.targetValue);
    if (target === 0) return 'neutral' as const;
    const ratio = val / target;
    if (definition.direction === 'down') {
      if (ratio <= 1) return 'good' as const;
      if (ratio <= 1.15) return 'warning' as const;
      return 'bad' as const;
    }
    if (ratio >= 1) return 'good' as const;
    if (ratio >= 0.85) return 'warning' as const;
    return 'bad' as const;
  }, [data, definition]);

  const value = useMemo(() => {
    if (!data) return 0;
    if (typeof data === 'number') return data;
    if (typeof data === 'object') {
      const keys = [
        'percentage',
        'accuracyPercentage',
        'perfectPercentage',
        'rate',
        'costPerUnit',
        'rotationRate',
        'daysOfInventory',
      ];
      for (const key of keys) {
        if (typeof data[key] === 'number') return data[key];
      }
      const vals = Object.values(data).filter((v) => typeof v === 'number');
      return vals.length > 0 ? (vals[0] as number) : 0;
    }
    return 0;
  }, [data]);

  const sparkData = useMemo(() => {
    if (!timeSeries || timeSeries.length === 0) return undefined;
    return timeSeries.map((d: any) => ({
      value: Number(d.actualValue ?? d.value ?? 0),
    }));
  }, [timeSeries]);

  return (
    <AiOverlay
      type="kpi"
      kpiCode={definition.code}
      kpiName={definition.name}
      value={value}
      target={definition.targetValue ? Number(definition.targetValue) : 0}
      direction={definition.direction === 'up' ? 'up' : 'down'}
      unit={definition.unitType === 'percentage' ? '%' : definition.unitType}
      status={status}
      timeSeries={timeSeries?.map((d: any) => ({
        date: d.date || d.period || '',
        value: Number(d.actualValue ?? d.value ?? 0),
      }))}
    >
      <KPICard
        title={definition.name}
        value={value}
        unit={definition.unitType === 'percentage' ? '%' : definition.unitType}
        target={definition.targetValue ? Number(definition.targetValue) : undefined}
        direction={definition.direction === 'up' ? 'up' : 'down'}
        status={status}
        loading={loading}
        subtitle={definition.code}
        sparklineData={sparkData}
        className="h-full"
      />
    </AiOverlay>
  );
}

export default function KpiCategoryGrid({
  startDate,
  endDate,
  selectedClass,
}: KpiCategoryGridProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_CONFIG))
  );

  const { data: definitions, isLoading: defsLoading } =
    trpc.kpi.listDefinitions.useQuery({});

  const filteredDefinitions = useMemo(() => {
    if (!definitions) return [];
    let filtered = definitions.filter((d: any) => d.isActive !== false);
    if (selectedClass && selectedClass !== 'all') {
      filtered = filtered.filter(
        (d: any) => d.indicatorClass === selectedClass
      );
    }
    return filtered;
  }, [definitions, selectedClass]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredDefinitions.forEach((def: any) => {
      const catCode = def.category?.code || 'UNCATEGORIZED';
      if (!groups[catCode]) groups[catCode] = [];
      groups[catCode].push(def);
    });
    return groups;
  }, [filteredDefinitions]);

  const toggleCategory = (code: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  if (defsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg mb-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-40 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const categoryEntries = Object.entries(groupedByCategory).sort(
    ([a], [b]) => {
      const orderA = CATEGORY_CONFIG[a]?.name ? 0 : 1;
      const orderB = CATEGORY_CONFIG[b]?.name ? 0 : 1;
      return orderA - orderB;
    }
  );

  return (
    <div className="space-y-4">
      {categoryEntries.map(([catCode, kpis]) => {
        const config = CATEGORY_CONFIG[catCode] || {
          name: catCode,
          icon: BarChart3,
          color: '#6B7280',
          bgClass: 'bg-gray-100 text-gray-700',
        };
        const Icon = config.icon;
        const isExpanded = expandedCategories.has(catCode);

        return (
          <div key={catCode} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleCategory(catCode)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', config.bgClass)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-900">{config.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {kpis.length} indicador{kpis.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <KpiBadges kpis={kpis} />
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {kpis.map((kpi: any) => (
                    <KpiQueryWrapper
                      key={kpi.code}
                      definition={kpi}
                      startDate={startDate}
                      endDate={endDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KpiQueryWrapper({
  definition,
  startDate,
  endDate,
}: {
  definition: any;
  startDate: Date;
  endDate: Date;
}) {
  const dataQuery = trpc.kpi.getKpiData.useQuery({
    code: definition.code,
    startDate,
    endDate,
  });

  const tsQuery = trpc.kpi.getKpiTimeSeries.useQuery({
    code: definition.code,
    startDate,
    endDate,
  });

  return (
    <KpiMiniCard
      definition={definition}
      data={dataQuery.data}
      timeSeries={tsQuery.data || []}
      loading={dataQuery.isLoading || tsQuery.isLoading}
    />
  );
}

function KpiBadges({ kpis }: { kpis: any[] }) {
  const count = kpis.length;
  return (
    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
      {count}
    </span>
  );
}
