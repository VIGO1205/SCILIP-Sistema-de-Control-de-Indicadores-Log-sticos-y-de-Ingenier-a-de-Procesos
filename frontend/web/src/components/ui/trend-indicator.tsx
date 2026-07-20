import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TrendIndicatorProps {
  value: number;
  className?: string;
}

export function TrendIndicator({ value, className }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {isPositive ? (
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      ) : isNegative ? (
        <TrendingDown className="h-4 w-4 text-red-500" />
      ) : (
        <Minus className="h-4 w-4 text-gray-500" />
      )}
      <span
        className={cn(
          'text-sm font-medium',
          isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-gray-600'
        )}
      >
        {Math.abs(value).toFixed(1)}%
      </span>
    </div>
  );
}
