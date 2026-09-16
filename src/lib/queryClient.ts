import { QueryClient, focusManager } from '@tanstack/react-query'

/**
 * Shared TanStack Query client. Phase 1 has almost no server-driven
 * queries (auth is an imperative side-effect flow, not a query), but the
 * provider is wired up now so Phase 2+ features can start using
 * `useQuery`/`useMutation` immediately without any provider plumbing.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      // Default `networkMode: 'online'` pauses a failed query's retry
      // indefinitely whenever TanStack Query's `onlineManager` believes the
      // browser is offline — and a paused query is neither `isLoading` nor
      // `isError`, so a page built around those two flags renders *nothing*
      // while paused, with no visible error and no way to recover short of
      // a real "online" event. That's the wrong tradeoff for this app: we
      // always talk to one specific API origin, so a fetch failure should
      // surface as a real, retryable error regardless of the browser's
      // (sometimes wrong — this exact hang was caused by a false offline
      // read in a sandboxed test browser) notion of general connectivity.
      networkMode: 'always',
    },
    mutations: {
      retry: 0,
      networkMode: 'always',
    },
  },
})

// `networkMode: 'always'` above only bypasses `onlineManager`'s "are we
// online" gate — but query-core's retry backoff loop has a SECOND,
// independent gate: `canContinue()` in `retryer.ts` requires
// `focusManager.isFocused()` to be true (backed by
// `document.visibilityState !== 'hidden'`) regardless of `networkMode`.
// A retry whose backoff delay elapses while the tab is backgrounded/hidden
// falls into the exact same silent `fetchStatus: 'paused'` state we just
// fixed `networkMode` for (neither `isLoading` nor `isError`), which is how
// a page built around those two flags can render nothing forever with no
// visible error. Since `refetchOnWindowFocus` is already off everywhere, we
// never rely on focus-driven refetches, so it's safe to pin focus "on"
// permanently and let real network failures surface as real errors instead
// of silently pausing whenever the tab isn't the active/visible one.
focusManager.setFocused(true)
