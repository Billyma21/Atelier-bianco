import { NextResponse, type NextRequest } from 'next/server';
import { isRequestAdmin, updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminLogin = pathname === '/admin/login';
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute && !isAdminLogin) {
    const admin = await isRequestAdmin(request);
    if (!admin) {
      const login = new URL('/admin/login', request.url);
      login.searchParams.set('next', pathname);
      return NextResponse.redirect(login);
    }
    return updateSession(request);
  }

  if (isAdminLogin) {
    const admin = await isRequestAdmin(request);
    if (admin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (pathname.startsWith('/mon-compte')) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (url && key) {
      const { createServerClient } = await import('@supabase/ssr');
      const supabase = createServerClient(url, key, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const login = new URL('/auth/login', request.url);
        login.searchParams.set('next', pathname);
        return NextResponse.redirect(login);
      }
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/admin/:path*', '/mon-compte/:path*', '/mon-compte'],
};
