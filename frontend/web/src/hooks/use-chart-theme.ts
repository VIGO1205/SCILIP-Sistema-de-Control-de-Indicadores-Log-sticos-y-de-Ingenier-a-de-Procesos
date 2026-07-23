'use client';

import { useTheme } from '@/components/providers/theme-provider';

export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    tooltip: {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
      color: isDark ? '#e5e7eb' : '#374151',
    },
    axisLine: isDark ? '#374151' : '#e5e7eb',
    tickText: isDark ? '#9ca3af' : '#6b7280',
    gridLine: isDark ? '#1f2937' : '#f3f4f6',
    referenceLine: isDark ? '#4b5563' : '#9ca3af',
    background: isDark ? '#111827' : '#ffffff',
  };
}
