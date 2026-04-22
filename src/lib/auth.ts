import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

const resendConfigured = Boolean(
  process.env.AUTH_RESEND_KEY && process.env.EMAIL_FROM,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: resendConfigured
    ? [
        Resend({
          apiKey: process.env.AUTH_RESEND_KEY,
          from: process.env.EMAIL_FROM!,
        }),
      ]
    : [],
});
