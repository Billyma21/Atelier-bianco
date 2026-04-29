import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { DEV_PLACEHOLDER_SUPABASE_URL, isValidUrl } from './supabase';

let cached: SupabaseClient | null = null;

function resolveUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && isValidUrl(url) && url !== DEV_PLACEHOLDER_SUPABASE_URL) return url;
  return null;
}

function resolveServiceKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

/** Client service role : serveur uniquement, jamais exposé au navigateur. */
export function tryGetSupabaseAdmin(): SupabaseClient | null {
  const url = resolveUrl();
  const key = resolveServiceKey();
  if (!url || !key) return null;
  if (!cached) {
    cached = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cached;
}

export function getSupabaseAdmin(): SupabaseClient {
  const client = tryGetSupabaseAdmin();
  if (!client) {
    throw new Error(
      'Supabase admin indisponible : définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return client;
}

/** @deprecated Utiliser getSupabaseAdmin() ou tryGetSupabaseAdmin(). */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabaseAdmin() as object, prop);
  },
});
