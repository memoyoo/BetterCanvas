import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { MobileSession } from "@bettercanvas/shared";
import { useRouter } from "expo-router";

import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
  subscribeToSessionChanges,
} from "@/lib/session";
import { onUnauthorized } from "@/lib/api";

type SessionContextValue = {
  loading: boolean;
  session: MobileSession | null;
  clearSession: () => Promise<void>;
  setSession: (session: MobileSession) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSessionState] = useState<MobileSession | null>(null);

  useEffect(() => {
    let mounted = true;

    getStoredSession()
      .then((storedSession) => {
        if (mounted) {
          setSessionState(storedSession);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSessionChanges((nextSession) => {
      setSessionState(nextSession);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    onUnauthorized(async () => {
      await clearStoredSession();
      router.replace("/connect-canvas");
    });

    return () => {
      onUnauthorized(null);
    };
  }, [router]);

  const setSession = useCallback(async (nextSession: MobileSession) => {
    await setStoredSession(nextSession);
  }, []);

  const clearSession = useCallback(async () => {
    await clearStoredSession();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      clearSession,
      loading,
      session,
      setSession,
    }),
    [clearSession, loading, session, setSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider.");
  }

  return context;
}
