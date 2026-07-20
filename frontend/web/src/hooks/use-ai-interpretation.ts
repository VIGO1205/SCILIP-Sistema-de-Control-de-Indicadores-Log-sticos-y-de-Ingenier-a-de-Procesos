'use client';

import { trpc } from '@/lib/trpc/react';

interface UseAiInterpretationKpi {
  type: 'kpi';
  kpiCode: string;
  kpiName: string;
  value: number;
  target: number;
  direction: 'up' | 'down';
  unit: string;
  status: 'good' | 'warning' | 'bad' | 'neutral';
  previousValue?: number;
  timeSeries?: { date: string; value: number }[];
  month?: string;
}

interface UseAiInterpretationChart {
  type: 'chart';
  chartType: 'donut' | 'bar' | 'trend';
  title: string;
  data: any;
  month?: string;
}

type UseAiInterpretationParams = (UseAiInterpretationKpi | UseAiInterpretationChart) & {
  enabled?: boolean;
};

export function useAiInterpretation(params: UseAiInterpretationParams) {
  const { enabled = false, ...queryParams } = params;

  const kpiQuery = trpc.ai.interpretKpi.useQuery(
    queryParams.type === 'kpi'
      ? {
          kpiCode: queryParams.kpiCode,
          kpiName: queryParams.kpiName,
          value: queryParams.value,
          target: queryParams.target,
          direction: queryParams.direction,
          unit: queryParams.unit,
          status: queryParams.status,
          previousValue: queryParams.previousValue,
          timeSeries: queryParams.timeSeries,
          month: queryParams.month,
        }
      : (undefined as any),
    {
      enabled: queryParams.type === 'kpi' && enabled,
      staleTime: 60 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  );

  const chartQuery = trpc.ai.interpretChart.useQuery(
    queryParams.type === 'chart'
      ? {
          chartType: queryParams.chartType,
          title: queryParams.title,
          data: queryParams.data,
          month: queryParams.month,
        }
      : (undefined as any),
    {
      enabled: queryParams.type === 'chart' && enabled,
      staleTime: 60 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  );

  if (queryParams.type === 'kpi') {
    return {
      text: kpiQuery.data?.text ?? null,
      isLoading: kpiQuery.isLoading,
      error: kpiQuery.error,
    };
  }

  return {
    text: chartQuery.data?.text ?? null,
    isLoading: chartQuery.isLoading,
    error: chartQuery.error,
  };
}
