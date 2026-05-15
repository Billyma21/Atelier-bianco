import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isValidUrl, resolvePublicSupabaseKeyForServer } from '@/lib/supabase';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const key = resolvePublicSupabaseKeyForServer();
  if (!url || !isValidUrl(url) || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

/** Vérifie si l’utilisateur courant (cookies) est admin via profiles.role ou email bootstrap. */
export async function isRequestAdmin(request: NextRequest): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const key = resolvePublicSupabaseKeyForServer();
  if (!url || !isValidUrl(url) || !key) return false;

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
  if (!user) return false;

  const bootstrap = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const email = user.email?.toLowerCase() ?? '';
  if (bootstrap && email === bootstrap) return true;
  if (email === 'kenzy@ab.be' || email === 'bilyma21@gmail.com') return true;
  if (user.app_metadata?.role === 'admin') return true;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return profile?.role === 'admin';
}
