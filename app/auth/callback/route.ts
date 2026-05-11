import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isValidUrl, resolvePublicSupabaseKeyForServer } from '@/lib/supabase';

function redirectLoginWithOAuthError(origin: string, message: string) {
  const q = new URLSearchParams();
  q.set('oauth_error', '1');
  q.set('reason', message.slice(0, 500));
  return NextResponse.redirect(`${origin}/auth/login?${q.toString()}`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/mon-compte';

  const oauthErr = searchParams.get('error');
  const oauthErrDesc = searchParams.get('error_description');
  if (oauthErr) {
    return redirectLoginWithOAuthError(
      origin,
      oauthErrDesc || oauthErr
    );
  }

  if (code) {
    const cookieStore = await cookies();
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
    const supabaseUrl = isValidUrl(envUrl) ? envUrl : '';
    const supabaseKey = resolvePublicSupabaseKeyForServer();

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext = next.startsWith('/') ? next : '/mon-compte';
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    return redirectLoginWithOAuthError(origin, error.message);
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
