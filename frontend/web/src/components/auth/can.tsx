'use client';

import React from 'react';
import { useAuth, Action, Subject } from '@/components/providers/auth-provider';

interface CanProps {
  action: Action;
  subject: Subject;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ action, subject, children, fallback = null }: CanProps) {
  const { can } = useAuth();

  if (can(action, subject)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export { Action } from '@/components/providers/auth-provider';
export type { Subject } from '@/components/providers/auth-provider';
