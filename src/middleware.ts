import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/accounts/:path*',
    '/transactions/:path*',
    '/budgets/:path*',
    '/goals/:path*',
    '/settings/:path*'
  ]
}