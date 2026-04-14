import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    /** Giriş yapılmamış oturumlarda sunucu `user` göndermeyebilir. */
    user?: (DefaultSession["user"] & { id?: string }) | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
