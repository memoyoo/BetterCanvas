import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { persistQueryCache, restoreQueryCache } from "@/lib/query-persist";
import { SessionProvider } from "@/providers/SessionProvider";

/**
 * Interval (ms) at which the in-memory React Query cache is flushed
 * to AsyncStorage so data survives app restarts.
 */
const PERSIST_INTERVAL_MS = 15_000;

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Show stale data instantly while refetching in the background.
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
          },
        },
      }),
  );
  const [restored, setRestored] = useState(false);

  // Restore persisted cache on boot
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const cachedState = await restoreQueryCache();

        if (cancelled) {
          return;
        }

        if (cachedState && typeof cachedState === "object" && "mutations" in cachedState && "queries" in cachedState) {
          const state = cachedState as { mutations: unknown[]; queries: Array<{ queryHash: string; queryKey: unknown[]; state: unknown }> };

          for (const query of state.queries) {
            queryClient.setQueryData(query.queryKey, (query.state as { data?: unknown })?.data);
          }
        }
      } catch {
        // Swallow restore errors — the app works fine without cache.
      } finally {
        if (!cancelled) {
          setRestored(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  // Periodically persist the cache to AsyncStorage
  useEffect(() => {
    if (!restored) {
      return;
    }

    const interval = setInterval(() => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll().map((query) => ({
        queryHash: query.queryHash,
        queryKey: query.queryKey,
        state: query.state,
      }));

      void persistQueryCache({ mutations: [], queries });
    }, PERSIST_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [queryClient, restored]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
