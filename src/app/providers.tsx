import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/firebase/AuthProvider'
import { TooltipProvider } from '@/components/ui/tooltip'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * Composition root for every cross-cutting provider. Order matters only
 * where there's an actual dependency — `AuthProvider` doesn't need
 * `QueryClientProvider` (Phase 1 auth is imperative, not query-based) but
 * nesting it inside keeps future Phase 2 auth-dependent queries simple.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
