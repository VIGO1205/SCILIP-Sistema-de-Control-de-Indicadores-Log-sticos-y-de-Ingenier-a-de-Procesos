import * as React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'good' | 'bad' | 'warning' | 'neutral';
  className?: string;
  children?: React.ReactNode;
}

export function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  const styles = {
    good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bad: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        styles[status],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
