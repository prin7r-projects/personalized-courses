import NextAuth from "next-auth";
import Email from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Email({
      server: {},
      from: "Curriculum7 <courses@reading-list.prin7r.com>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
    error: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isOperator = (user as any).isOperator ?? false;
      }
      return session;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
