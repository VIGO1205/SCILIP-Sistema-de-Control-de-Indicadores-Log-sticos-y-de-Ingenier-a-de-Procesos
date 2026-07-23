import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-gray-200 dark:border-dark-tremor-border bg-white dark:bg-dark-tremor-background text-gray-950 dark:text-dark-tremor-content-strong shadow-sm transition-colors',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };
