import { trpc } from '@/lib/trpc/react';

interface UseKPIOptions {
  code: string;
  startDate?: Date;
  endDate?: Date;
  supplierId?: string;
  warehouseId?: string;
  machineId?: string;
}

export function useKPI(options: UseKPIOptions) {
  const {
    code,
    startDate = new Date(new Date().getFullYear(), 0, 1),
    endDate = new Date(),
    supplierId,
    warehouseId,
    machineId,
  } = options;

  const kpiQuery = trpc.kpi.getKpiData.useQuery({
    code,
    startDate,
    endDate,
    supplierId,
    warehouseId,
    machineId,
  });

  const timeSeriesQuery = trpc.kpi.getKpiTimeSeries.useQuery({
    code,
    startDate,
    endDate,
    supplierId,
    warehouseId,
    machineId,
  });

  return {
    data: kpiQuery.data,
    timeSeries: timeSeriesQuery.data,
    isLoading: kpiQuery.isLoading || timeSeriesQuery.isLoading,
    error: kpiQuery.error || timeSeriesQuery.error,
    refetch: kpiQuery.refetch,
  };
}
