import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      displayName?: string | null;
    };
  }

  interface User {
    displayName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    displayName?: string | null;
  }
}
