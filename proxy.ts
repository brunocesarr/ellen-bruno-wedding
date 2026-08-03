import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/auth/callback']

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (PUBLIC_ADMIN_PATHS.some((p) => request.nextUrl.pathname === p)) {
    return NextResponse.next()
  }

  const res = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (
          toSet: { name: string; value: string; options: CookieOptions }[]
        ) =>
          toSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          ),
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - api routes
     * - _next/static  (JS/CSS chunks)  ← the cause of the SyntaxError
     * - _next/image   (image optimiser)
     * - metadata routes and static files by extension
     */
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|ttf|otf|woff|woff2)$).*)',
  ],
}
