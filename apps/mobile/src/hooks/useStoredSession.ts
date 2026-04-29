import { useSession } from "@/providers/SessionProvider";

export function useStoredSession() {
  return useSession();
}
