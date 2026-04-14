import { withAuth } from "next-auth/middleware";
import { resolveNextAuthSecret } from "@/lib/auth-secret";

export default withAuth({
  secret: resolveNextAuthSecret(),
  pages: { signIn: "/admin/giris" },
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin/giris")) return true;
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
