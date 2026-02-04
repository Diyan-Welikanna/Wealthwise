import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/income/:path*",
    "/budget/:path*",
    "/expenses/:path*",
    "/profile/:path*",
  ],
}
