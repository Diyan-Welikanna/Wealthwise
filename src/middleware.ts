import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = [
    '/dashboard',
    '/income',
    '/budget', 
    '/expenses',
    '/profile',
    '/recurring'
  ].some(path => request.nextUrl.pathname.startsWith(path))

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to signin for protected routes
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/income/:path*',
    '/budget/:path*',
    '/expenses/:path*',
    '/profile/:path*',
    '/recurring/:path*',
    '/auth/:path*'
  ],
}
