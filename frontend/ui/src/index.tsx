import type { ReactNode } from 'react';

/** Shared UI primitives live here; extend as the design system grows. */
export function UiRoot({ children }: { children?: ReactNode }) {
  return children ?? null;
}
