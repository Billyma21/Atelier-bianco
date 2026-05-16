import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isOauthProviderDisabledError } from '@/lib/auth-oauth';
import { isValidUrl, resolvePublicSupabaseKeyForServer } from '@/lib/supabase';

/**
 * Démarre OAuth Google côté serveur : vérifie la réponse de /authorize
 * pour éviter d’envoyer l’utilisateur vers une page JSON (ex. provider désactivé).
 */
export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const origin = reqUrl.origin;
  const referer = request.headers.get('referer') || '';
  const errorBase =
    referer.includes('/auth/register') ? `${origin}/auth/register` : `${origin}/auth/login`;

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const supabaseUrl = isValidUrl(envUrl) ? envUrl : '';
  const supabaseKey = resolvePublicSupabaseKeyForServer();

  if (!supabaseUrl || !supabaseKey) {
    const q = new URLSearchParams();
    q.set('oauth_error', '1');
    q.set('reason', 'Supabase non configure : URL ou cle publique manquante.');
    return NextResponse.redirect(`${errorBase}?${q.toString()}`);
  }

  const cookieStore = await cookies();
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

  const callbackUrl = `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    const q = new URLSearchParams();
    q.set('oauth_error', '1');
    q.set('reason', (error?.message || 'Impossible de preparer la connexion Google.').slice(0, 800));
    return NextResponse.redirect(`${errorBase}?${q.toString()}`);
  }

  try {
    const probe = await fetch(data.url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; AtelierBianco/1.0; +https://atelierbianco.be) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
      },
    });

    if (probe.status === 400) {
      let reason = 'Erreur OAuth';
      try {
        const j = (await probe.json()) as { msg?: string; error_description?: string; message?: string };
        reason = j.msg || j.error_description || j.message || JSON.stringify(j);
      } catch {
        reason = (await probe.text()) || reason;
      }
      const q = new URLSearchParams();
      q.set('oauth_error', '1');
      q.set('reason', reason.slice(0, 800));
      if (isOauthProviderDisabledError(reason)) {
        q.set('hint', 'google_disabled');
      }
      return NextResponse.redirect(`${errorBase}?${q.toString()}`);
    }
  } catch {
    /* probe impossible : on laisse la redirection normale */
  }

  return NextResponse.redirect(data.url);
}
