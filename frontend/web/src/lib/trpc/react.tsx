'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../../../backend/api/src/trpc/trpc.router';

export const trpc = createTRPCReact<AppRouter>();
