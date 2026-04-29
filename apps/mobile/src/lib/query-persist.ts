import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "bettercanvas.query-cache";
const CACHE_VERSION = 1;

type PersistedCache = {
  buster: string;
  clientState: unknown;
  timestamp: number;
  version: number;
};

/**
 * Maximum age for the persisted cache (24 hours).
 * Stale data older than this is discarded on boot.
 */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Cache buster string. Bump when the response shapes change
 * to force a fresh fetch rather than restoring incompatible data.
 */
const BUSTER = "v1";

export async function persistQueryCache(clientState: unknown) {
  try {
    const payload: PersistedCache = {
      buster: BUSTER,
      clientState,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Persistence is best-effort; swallow write errors.
  }
}

export async function restoreQueryCache(): Promise<unknown | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: PersistedCache = JSON.parse(raw);

    if (parsed.buster !== BUSTER) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    if (Date.now() - parsed.timestamp > MAX_AGE_MS) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.clientState;
  } catch {
    await AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
    return null;
  }
}

export async function clearQueryCache() {
  await AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
}
