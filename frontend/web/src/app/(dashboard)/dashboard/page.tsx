'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Grid, Text, Card, Badge, Divider } from '@tremor/react';
import {
  ShoppingCart,
  Package,
  Truck,
  Users,
  Globe,
  Factory,
  Filter,
  BarChart3,
  Calendar,
  LayoutGrid,
  TrendingUp,
  Info,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
} from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { AiOverlay } from '@/components/ui/ai-interpretation';
import { cn, formatNumber } from '@/lib/utils';
import { trpc } from '@/lib/trpc/react';
import { useAuth } from '@/components/providers/auth-provider';
import AlertsPanel from '@/components/dashboard/alerts-panel';
import SummaryDonut from '@/components/dashboard/summary-donut';
import CategoryBarChart from '@/components/dashboard/category-bar-chart';
import GlobalTrendChart from '@/components/dashboard/global-trend-chart';
import KpiCategoryGrid from '@/components/dashboard/kpi-category-grid';
import EmptyDashboard from '@/components/dashboard/empty-dashboard';

const MONTHS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const CATEGORY_NAMES: Record<string, string> = {
  CAT_3_1: 'Compras',
  CAT_3_2: 'Inventarios',
  CAT_3_3: 'Almacenamiento',
  CAT_3_4: 'Transporte',
  CAT_3_5: 'Serv. Cliente',
  CAT_3_6: 'Com. Exterior',
};

function getMonthOptions() {
  const now = new Date();
  const options: { label: string; value: string; startDate: Date; endDate: Date }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    options.push({
      label: `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`,
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      startDate: d,
      endDate: lastDay > now ? now : lastDay,
    });
  }
  return options;
}

const KPI_VALUE_KEYS = [
  'certificationPercentage', 'qualityPercentage', 'volumePercentage', 'rejectedPercentage',
  'rotationRate', 'daysOfInventory', 'agingPercentage', 'economicInventoryValue',
  'accuracyPercentage', 'perfectPercentage', 'perfectDeliveriesPercentage',
  'onTimePercentage', 'completePercentage',
  'costPerUnit', 'costPerDispatchedUnit', 'costPerM2', 'costPerEmployee', 'costPerDriver',
  'utilizationPercentage', 'performancePercentage', 'efficiencyRatio', 'percentage',
  'compliancePercentage', 'unitsPerEmployee',
  'logisticsCostPercentage', 'logisticsCostVsProfitPercentage', 'cediCostVsSalesPercentage',
  'unitCost', 'rate',
];

function extractKpiValue(data: any): number {
  if (!data) return 0;
  if (typeof data === 'number') return data;
  if (typeof data !== 'object') return 0;
  // Buscar en formato directo: { efficiencyRatio: 1 }
  for (const key of KPI_VALUE_KEYS) {
    if (typeof data[key] === 'number') return data[key];
  }
  // Buscar en formato anidado: { result: { data: { efficiencyRatio: 1 } } }
  if (data.result?.data && typeof data.result.data === 'object') {
    for (const key of KPI_VALUE_KEYS) {
      if (typeof data.result.data[key] === 'number') return data.result.data[key];
    }
  }
  // Buscar en formato anidado: { data: { efficiencyRatio: 1 } }
  if (data.data && typeof data.data === 'object') {
    for (const key of KPI_VALUE_KEYS) {
      if (typeof data.data[key] === 'number') return data.data[key];
    }
  }
  const vals = Object.values(data).filter((v) => typeof v === 'number');
  return vals.length > 0 ? (vals[0] as number) : 0;
}

function computeKpiStatus(
  data: any,
  targetValue: number | null | undefined,
  direction: string | null | undefined
): 'good' | 'bad' | 'warning' | 'neutral' {
  if (!data || !targetValue) return 'neutral';
  const val = extractKpiValue(data);
  const target = Number(targetValue);
  if (target === 0) return 'neutral';
  const ratio = val / target;
  if (direction === 'down') {
    if (ratio <= 1) return 'good';
    if (ratio <= 1.15) return 'warning';
    return 'bad';
  }
  if (ratio >= 1) return 'good';
  if (ratio >= 0.85) return 'warning';
  return 'bad';
}

function getInsight(
  statusCounts: { good: number; warning: number; bad: number; neutral: number },
  total: number
): { text: string; type: 'success' | 'warning' | 'danger' } {
  const effective = statusCounts.good + statusCounts.warning + statusCounts.bad;
  if (effective === 0)
    return { text: 'No hay datos suficientes para generar un análisis.', type: 'warning' };
  const complianceRate = (statusCounts.good / effective) * 100;
  if (complianceRate >= 80)
    return {
      text: `El ${formatNumber(complianceRate, 0)}% de los indicadores están dentro de la meta. El desempeño logístico es satisfactorio. Se recomienda mantener las prácticas actuales y monitorear los ${statusCounts.warning + statusCounts.bad} indicadores pendientes.`,
      type: 'success',
    };
  if (complianceRate >= 60)
    return {
      text: `El ${formatNumber(complianceRate, 0)}% de los indicadores cumplen meta. Hay ${statusCounts.warning} indicadores en zona de alerta que requieren atención preventiva para evitar desviaciones mayores.`,
      type: 'warning',
    };
  return {
    text: `Solo el ${formatNumber(complianceRate, 0)}% de los indicadores cumplen meta. Se identifican ${statusCounts.bad} indicadores en estado crítico que requieren acción inmediata. Se recomienda priorizar las áreas con mayor desviación.`,
    type: 'danger',
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const monthOptions = useMemo(() => getMonthOptions(), []);
  // Default to the second option (June 2026) since seeded data only goes up to June
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[1]?.value || monthOptions[0]?.value);
  const [selectedClass, setSelectedClass] = useState('all');

  const currentPeriod = useMemo(
    () => monthOptions.find((o) => o.value === selectedMonth) || monthOptions[0],
    [selectedMonth, monthOptions]
  );

  const { data: definitions, isLoading: defsLoading } =
    trpc.kpi.listDefinitions.useQuery({});

  const kpiQueries = useMemo(() => {
    if (!definitions) return [];
    return definitions
      .filter((d: any) => d.isActive !== false)
      .map((def: any) => ({
        code: def.code,
        name: def.name,
        targetValue: def.targetValue ? Number(def.targetValue) : null,
        direction: def.direction,
        unitType: def.unitType,
        categoryCode: def.category?.code,
        categoryName: def.category?.name,
        indicatorClass: def.indicatorClass,
      }));
  }, [definitions]);

  const isEmpty = !defsLoading && (!definitions || definitions.length === 0);

  return (
    <main className="p-4 sm:p-5 bg-gray-50 min-h-screen">
      <DashboardHeader
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        monthOptions={monthOptions}
        userName={user?.fullName}
      />

      {isEmpty ? (
        <EmptyDashboard userName={user?.fullName} />
      ) : (
        <KpiDataFetcher
          kpis={kpiQueries}
          period={currentPeriod}
          selectedClass={selectedClass}
        />
      )}
    </main>
  );
}

function DashboardHeader({
  selectedMonth,
  onMonthChange,
  selectedClass,
  onClassChange,
  monthOptions,
  userName,
}: {
  selectedMonth: string;
  onMonthChange: (v: string) => void;
  selectedClass: string;
  onClassChange: (v: string) => void;
  monthOptions: { label: string; value: string }[];
  userName?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Panel de Control BI Logístico
          </h1>
          <p className="text-gray-500 mt-0.5 text-xs">
            {userName ? `Bienvenido, ${userName}. ` : ''}
            Monitoreo consolidado de indicadores de gestión logística
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm">
            <Calendar className="text-gray-400 h-3.5 w-3.5" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="border-none text-xs font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm">
            <Filter className="text-gray-400 h-3.5 w-3.5" />
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="border-none text-xs font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las Clases</option>
              <option value="UTILIZATION">Utilización</option>
              <option value="PERFORMANCE">Rendimiento</option>
              <option value="PRODUCTIVITY">Productividad</option>
            </select>
          </div>
        </div>
      </div>
      <Divider className="mt-4" />
    </div>
  );
}

function KpiDataFetcher({
  kpis,
  period,
  selectedClass,
}: {
  kpis: any[];
  period: { startDate: Date; endDate: Date; label: string };
  selectedClass?: string;
}) {
  const [selectedKpiForTrend, setSelectedKpiForTrend] = useState('NOR_DIS_IND_24');

  const filteredKpis = useMemo(() => {
    if (!selectedClass || selectedClass === 'all') return kpis;
    return kpis.filter((k) => k.indicatorClass === selectedClass);
  }, [kpis, selectedClass]);

  const periodKey = `${period.startDate.toISOString()}-${period.endDate.toISOString()}`;

  const dataQueries = trpc.useQueries((t) =>
    kpis.map((kpi) =>
      t.kpi.getKpiData({
        code: kpi.code,
        startDate: period.startDate,
        endDate: period.endDate,
      })
    )
  );

  const tsQueries = trpc.useQueries((t) =>
    kpis.map((kpi) =>
      t.kpi.getKpiTimeSeries({
        code: kpi.code,
        startDate: period.startDate,
        endDate: period.endDate,
      })
    )
  );

  const trendQuery = trpc.kpi.getKpiTimeSeries.useQuery({
    code: selectedKpiForTrend,
    startDate: new Date(period.startDate.getFullYear(), 0, 1),
    endDate: period.endDate,
  });

  const pendingApprovals = trpc.purchasing.getPendingApprovals.useQuery(undefined, {
    retry: false,
  });

  const allResults = useMemo(
    () =>
      kpis.map((kpi, idx) => ({
        ...kpi,
        data: dataQueries[idx]?.data,
        timeSeries: tsQueries[idx]?.data || [],
        isLoading: dataQueries[idx]?.isLoading || tsQueries[idx]?.isLoading,
      })),
    [kpis, dataQueries, tsQueries]
  );

  const statusCounts = useMemo(() => {
    const counts = { good: 0, warning: 0, bad: 0, neutral: 0 };
    allResults.forEach((r) => {
      if (!r.isLoading && r.data) {
        const s = computeKpiStatus(r.data, r.targetValue, r.direction);
        counts[s]++;
      }
    });
    return counts;
  }, [allResults]);

  const categoryCompliance = useMemo(() => {
    const groups: Record<string, { total: number; good: number; warning: number; bad: number }> = {};
    allResults.forEach((r) => {
      const cat = r.categoryCode || 'UNKNOWN';
      if (!groups[cat]) groups[cat] = { total: 0, good: 0, warning: 0, bad: 0 };
      groups[cat].total++;
      if (!r.isLoading && r.data) {
        const s = computeKpiStatus(r.data, r.targetValue, r.direction);
        if (s === 'good') groups[cat].good++;
        else if (s === 'warning') groups[cat].warning++;
        else if (s === 'bad') groups[cat].bad++;
      }
    });
    return Object.entries(groups).map(([code, g]) => ({
      code,
      name: CATEGORY_NAMES[code] || code,
      totalKpis: g.total,
      good: g.good,
      warning: g.warning,
      bad: g.bad,
      compliance: g.total > 0 ? (g.good / g.total) * 100 : 0,
    }));
  }, [allResults]);

  const alerts = useMemo(() => {
    return allResults
      .filter((r) => !r.isLoading && r.data)
      .map((r) => {
        const s = computeKpiStatus(r.data, r.targetValue, r.direction);
        if (s !== 'bad' && s !== 'warning') return null;
        const val = extractKpiValue(r.data);
        return {
          kpiCode: r.code,
          kpiName: r.name,
          category: r.categoryName || r.categoryCode || '',
          actualValue: val,
          targetValue: r.targetValue || 0,
          unit: r.unitType === 'percentage' ? '%' : r.unitType || '',
          status: s as 'bad' | 'warning',
          direction: (r.direction === 'down' ? 'down' : 'up') as 'up' | 'down',
        };
      })
      .filter(Boolean) as any[];
  }, [allResults]);

  const trendSeries = useMemo(() => {
    if (!trendQuery.data) return [];
    const kpi = kpis.find((k) => k.code === selectedKpiForTrend);
    return [
      {
        name: kpi?.name || selectedKpiForTrend,
        color: '#4F46E5',
        data: trendQuery.data.map((d: any) => ({
          date: new Date(d.period || d.periodDate).toISOString().split('T')[0],
          value: Number(d.value ?? d.actualValue ?? 0),
          target: d.target ?? (kpi?.targetValue ? Number(kpi.targetValue) : undefined),
        })),
      },
    ];
  }, [trendQuery.data, selectedKpiForTrend, kpis]);

  const topKpis = useMemo(() => {
    const priority = ['NOR_DIS_IND_03', 'NOR_DIS_IND_11', 'NOR_DIS_IND_18', 'NOR_DIS_IND_24'];
    return priority
      .map((code) => allResults.find((r) => r.code === code))
      .filter(Boolean)
      .slice(0, 4);
  }, [allResults]);

  const isLoading = allResults.length > 0 && allResults.every((r) => r.isLoading);
  const insight = getInsight(statusCounts, filteredKpis.length);
  const approvalsCount = pendingApprovals.data?.length ?? 0;

  return (
    <>
      {/* ═══ KPIs Principales ═══ */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-primary" />
            Indicadores Principales
          </h2>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {period.label}
          </span>
        </div>
        <Grid numItemsMd={2} numItemsLg={4} className="gap-3">
          {topKpis.map((kpi) => (
            <KpiCardWithData key={kpi.code} kpi={kpi} />
          ))}
        </Grid>
      </section>

      {/* ═══ Panel de Análisis ═══ */}
      <section className="mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-3">
            <AiOverlay
              type="chart"
              chartType="donut"
              title="Desempeño Global"
              data={statusCounts}
            >
              <SummaryDonut
                good={statusCounts.good}
                warning={statusCounts.warning}
                bad={statusCounts.bad}
                neutral={statusCounts.neutral}
                loading={isLoading}
              />
            </AiOverlay>
          </div>
          <div className="lg:col-span-5">
            <AiOverlay
              type="chart"
              chartType="bar"
              title="Cumplimiento por Categoría"
              data={categoryCompliance}
            >
              <CategoryBarChart categoryData={categoryCompliance} loading={isLoading} />
            </AiOverlay>
          </div>
          <div className="lg:col-span-4">
            <AlertsPanel alerts={alerts} loading={isLoading} />
          </div>
        </div>
      </section>

      {/* ═══ Interpretación del Analista ═══ */}
      <section className="mb-5">
        <InsightCard
          insight={insight}
          statusCounts={statusCounts}
          totalKpis={filteredKpis.length}
          approvalsCount={approvalsCount}
          periodLabel={period.label}
          loading={isLoading}
        />
      </section>

      {/* ═══ Tendencia Global ═══ */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            Tendencia Mensual
          </h2>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm">
            <span className="text-[10px] font-medium text-gray-400">KPI:</span>
            <select
              value={selectedKpiForTrend}
              onChange={(e) => setSelectedKpiForTrend(e.target.value)}
              className="border-none text-[11px] font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              {kpis.map((kpi) => (
                <option key={kpi.code} value={kpi.code}>{kpi.name}</option>
              ))}
            </select>
          </div>
        </div>
        <AiOverlay
          type="chart"
          chartType="trend"
          title={kpis.find((k) => k.code === selectedKpiForTrend)?.name || 'Tendencia'}
          data={trendSeries[0]?.data || []}
        >
          <GlobalTrendChart series={trendSeries} loading={trendQuery.isLoading} />
        </AiOverlay>
      </section>

      {/* ═══ Grid Completo por Categoría ═══ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4 text-primary" />
            Catálogo Completo de Indicadores
            <Badge className="ml-1" size="sm" color="gray">
              {filteredKpis.length}
            </Badge>
          </h2>
        </div>
        <KpiCategoryGrid
          startDate={period.startDate}
          endDate={period.endDate}
          selectedClass={selectedClass}
        />
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════
   Tarjeta de Interpretación / Insight
   ═══════════════════════════════════════════ */
function InsightCard({
  insight,
  statusCounts,
  totalKpis,
  approvalsCount,
  periodLabel,
  loading,
}: {
  insight: { text: string; type: 'success' | 'warning' | 'danger' };
  statusCounts: { good: number; warning: number; bad: number; neutral: number };
  totalKpis: number;
  approvalsCount: number;
  periodLabel: string;
  loading: boolean;
}) {
  const config = {
    success: {
      bg: 'bg-success/5',
      border: 'border-success/20',
      icon: CheckCircle2,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      label: 'Desempeño Satisfactorio',
      labelBg: 'bg-success/10',
      labelColor: 'text-success',
    },
    warning: {
      bg: 'bg-warning/5',
      border: 'border-warning/20',
      icon: AlertTriangle,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      label: 'Requiere Atención',
      labelBg: 'bg-warning/10',
      labelColor: 'text-warning',
    },
    danger: {
      bg: 'bg-danger/5',
      border: 'border-danger/20',
      icon: XCircle,
      iconBg: 'bg-danger/10',
      iconColor: 'text-danger',
      label: 'Acción Requerida',
      labelBg: 'bg-danger/10',
      labelColor: 'text-danger',
    },
  };

  const c = config[insight.type];
  const Icon = c.icon;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border shadow-sm p-4', c.bg, c.border)}>
      <div className="flex items-start gap-3">
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', c.iconBg)}>
          <Icon className={cn('h-5 w-5', c.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', c.labelBg, c.labelColor)}>
              {c.label}
            </span>
            <span className="text-[10px] text-gray-400">{periodLabel}</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">{insight.text}</p>
          <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-gray-200/60">
            <StatPill
              icon={CheckCircle2}
              label="Óptimos"
              value={statusCounts.good}
              color="text-success"
              bgColor="bg-success/10"
            />
            <StatPill
              icon={AlertTriangle}
              label="Alerta"
              value={statusCounts.warning}
              color="text-warning"
              bgColor="bg-warning/10"
            />
            <StatPill
              icon={XCircle}
              label="Críticos"
              value={statusCounts.bad}
              color="text-danger"
              bgColor="bg-danger/10"
            />
            <StatPill
              icon={Minus}
              label="Sin Meta"
              value={statusCounts.neutral}
              color="text-gray-500"
              bgColor="bg-gray-100"
            />
            {approvalsCount > 0 && (
              <StatPill
                icon={BarChart3}
                label="Pendientes"
                value={approvalsCount}
                color="text-primary"
                bgColor="bg-primary/10"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('h-5 w-5 rounded flex items-center justify-center', bgColor)}>
        <Icon className={cn('h-3 w-3', color)} />
      </div>
      <div>
        <span className={cn('text-xs font-bold', color)}>{value}</span>
        <span className="text-[9px] text-gray-400 ml-1">{label}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   KPI Card con datos
   ═══════════════════════════════════════════ */
function KpiCardWithData({
  kpi,
}: {
  kpi: any;
}) {
  const data = kpi.data;
  const isLoading = kpi.isLoading;
  const value = extractKpiValue(data);

  const previousValue = useMemo(() => {
    if (!kpi.timeSeries || kpi.timeSeries.length < 2) return undefined;
    const prev = kpi.timeSeries[kpi.timeSeries.length - 2];
    return Number(prev.value ?? prev.actualValue ?? 0);
  }, [kpi.timeSeries]);

  const ICON_MAP: Record<string, React.ElementType> = {
    NOR_DIS_IND_03: ShoppingCart,
    NOR_DIS_IND_11: Package,
    NOR_DIS_IND_18: Truck,
    NOR_DIS_IND_24: Users,
  };
  const Icon = ICON_MAP[kpi.code] || BarChart3;

  const sparkData = useMemo(() => {
    if (!kpi.timeSeries || kpi.timeSeries.length === 0) return undefined;
    return kpi.timeSeries.map((d: any) => ({
      value: Number(d.value ?? d.actualValue ?? 0),
    }));
  }, [kpi.timeSeries]);

  const status = useMemo(() => {
    if (!data || isLoading) return 'neutral' as const;
    return computeKpiStatus(data, kpi.targetValue, kpi.direction);
  }, [data, isLoading, kpi.targetValue, kpi.direction]);

  const timeSeriesFormatted = useMemo(() => {
    if (!kpi.timeSeries) return undefined;
    return kpi.timeSeries.map((d: any) => ({
      date: d.date || d.period || '',
      value: Number(d.value ?? d.actualValue ?? 0),
    }));
  }, [kpi.timeSeries]);

  return (
    <AiOverlay
      type="kpi"
      kpiCode={kpi.code}
      kpiName={kpi.name}
      value={value}
      target={kpi.targetValue}
      direction={kpi.direction === 'down' ? 'down' : 'up'}
      unit={kpi.unitType === 'percentage' ? '%' : kpi.unitType}
      status={status}
      previousValue={previousValue}
      timeSeries={timeSeriesFormatted}
    >
      <KPICard
        title={kpi.name}
        value={value}
        unit={kpi.unitType === 'percentage' ? '%' : kpi.unitType}
        target={kpi.targetValue}
        direction={kpi.direction === 'down' ? 'down' : 'up'}
        previousValue={previousValue}
        loading={isLoading}
        subtitle={kpi.code}
        icon={<Icon className="h-4 w-4" />}
        sparklineData={sparkData}
      />
    </AiOverlay>
  );
}
