import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import EmailProvider from "next-auth/providers/email";

export enum UserRole {
  user = "user",
  admin = "admin",
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth/adapters" {
  interface AdapterUser {
    login?: string;
    role?: UserRole;
    dashboardEnabled?: boolean;
    isTeamAdmin?: boolean;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login?: string;
      role?: UserRole;
      dashboardEnabled?: boolean;
      isAdmin?: boolean;
      expires?: string;
      isTeamAdmin?: boolean;
    };
    accessToken?: string;
  }

  export interface Profile {
    login: string;
  }

  interface User {
    role?: UserRole;
    login?: string;
    expires?: string;
    isTeamAdmin?: boolean;
    isAdmin?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, email, account, profile }) {
      try {
        console.log("SignIn callback:", { user, email, account });
        const userEmail = user?.email;
        if (!userEmail) {
          console.error("No email provided");
          return false;
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async session({ session, token, user }) {
      try {
        console.log("Session callback:", { session, token, user });
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub || user?.id,
            role: user?.role || "user",
            login: user?.login,
            isAdmin: user?.isAdmin || false,
          },
        };
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async jwt({ token, user, account, profile }) {
      try {
        console.log("JWT callback:", { token, user, account });
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.isAdmin = user.isAdmin;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
