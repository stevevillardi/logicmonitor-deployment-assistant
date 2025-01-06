'use client';

import { DeploymentsProvider as Provider } from '@/app/contexts/DeploymentsContext';

// Creates a client boundary for the context provider
export function DeploymentsProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
} 