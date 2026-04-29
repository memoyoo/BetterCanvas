import "server-only";

import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

import { getPrismaClient } from "@/lib/db";

const databaseConfigured = Boolean(process.env.DATABASE_URL);

export const magicLinkConfigured = Boolean(
  databaseConfigured &&
    process.env.AUTH_SECRET &&
    process.env.AUTH_RESEND_KEY &&
    process.env.EMAIL_FROM,
);

const adapter = databaseConfigured
  ? PrismaAdapter(getPrismaClient())
  : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: adapter ? "database" : "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: magicLinkConfigured
    ? [
        Resend({
          apiKey: process.env.AUTH_RESEND_KEY,
          from: process.env.EMAIL_FROM!,
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.displayName = user.displayName ?? user.name ?? null;
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? "";
        session.user.displayName =
          user?.displayName ??
          (typeof token.displayName === "string" ? token.displayName : null) ??
          session.user.name ??
          null;
      }

      return session;
    },
  },
});
