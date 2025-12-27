// lib/supabase/proxy.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATH_PREFIXES = ['/auth']

function isPublicPath(pathname: string) {
  if (pathname === '/') return false
  return PUBLIC_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Refresh token and get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Route protection
  const pathname = request.nextUrl.pathname
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
