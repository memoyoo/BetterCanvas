import * as SecureStore from "expo-secure-store";

import type { MobileSession } from "@bettercanvas/shared";
import { mobileSessionSchema } from "@bettercanvas/shared";

const SESSION_KEY = "bettercanvas.session";
const sessionListeners = new Set<(session: MobileSession | null) => void>();

function notifySessionListeners(session: MobileSession | null) {
  sessionListeners.forEach((listener) => {
    listener(session);
  });
}

export function subscribeToSessionChanges(
  listener: (session: MobileSession | null) => void,
) {
  sessionListeners.add(listener);

  return () => {
    sessionListeners.delete(listener);
  };
}

export async function getStoredSession() {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const validated = mobileSessionSchema.safeParse(parsed);

    if (!validated.success) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      notifySessionListeners(null);
      return null;
    }

    return validated.data;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    notifySessionListeners(null);
    return null;
  }
}

export async function setStoredSession(session: MobileSession) {
  const validatedSession = mobileSessionSchema.parse(session);

  await SecureStore.setItemAsync(
    SESSION_KEY,
    JSON.stringify(validatedSession),
  );

  notifySessionListeners(validatedSession);
}

export async function clearStoredSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
  notifySessionListeners(null);
}
