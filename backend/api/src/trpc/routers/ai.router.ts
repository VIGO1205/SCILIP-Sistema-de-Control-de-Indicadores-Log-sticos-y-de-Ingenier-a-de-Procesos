import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

const interpretKpiInput = z.object({
  kpiCode: z.string(),
  kpiName: z.string(),
  value: z.number(),
  target: z.number(),
  direction: z.enum(['up', 'down']),
  unit: z.string(),
  status: z.enum(['good', 'warning', 'bad', 'neutral']),
  previousValue: z.number().optional(),
  timeSeries: z.array(z.object({ date: z.string(), value: z.number() })).optional(),
  month: z.string().optional(),
});

const interpretChartInput = z.object({
  chartType: z.enum(['donut', 'bar', 'trend']),
  title: z.string(),
  data: z.any(),
  month: z.string().optional(),
});

export const aiRouter = router({
  interpretKpi: protectedProcedure
    .input(interpretKpiInput)
    .query(async ({ ctx, input }) => {
      return ctx.aiService.interpretKpi(input as any);
    }),

  interpretChart: protectedProcedure
    .input(interpretChartInput)
    .query(async ({ ctx, input }) => {
      return ctx.aiService.interpretChart(input as any);
    }),
});
