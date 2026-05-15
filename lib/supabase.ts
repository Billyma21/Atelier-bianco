import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/** Ne jamais utiliser la clé service_role côté navigateur : uniquement NEXT_PUBLIC_SUPABASE_* pour le client public. */
/** URL factice : le navigateur ne peut pas joindre ce domaine → « Failed to fetch » si .env n’est pas configuré. */
export const DEV_PLACEHOLDER_SUPABASE_URL = 'https://configure-env.supabase.co';
/** JWT factice (signature invalide) pour éviter un crash au chargement si .env.local manque ; les requêtes échoueront tant que les vraies clés ne sont pas configurées. */
const DEV_PLACEHOLDER_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbmZpZ3VyZS1lbnYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMH0.invalid-signature-placeholder';

export const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/** Clé publique : JWT anon classique (eyJ…) ou clé « Publishable » du dashboard (sb_publishable_…). */
export const isSupabaseKey = (key: string) => {
  return !!(key && (key.startsWith('eyJ') || key.startsWith('sb_publishable_')));
};

/** Clé publique réelle pour le serveur (pas le JWT placeholder dev) : publishable ou anon. */
export function resolvePublicSupabaseKeyForServer(): string | null {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (publishable && isSupabaseKey(publishable)) return publishable;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (anon && isSupabaseKey(anon) && anon !== DEV_PLACEHOLDER_ANON) return anon;
  return null;
}

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && isValidUrl(url)) return url;
  return DEV_PLACEHOLDER_SUPABASE_URL;
};

/** True si l’URL et une clé publique réelle (anon ou publishable) sont définies. */
export function isSupabaseBrowserConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!(
    url &&
    isValidUrl(url) &&
    url !== DEV_PLACEHOLDER_SUPABASE_URL &&
    resolvePublicSupabaseKeyForServer()
  );
}

const getSupabaseAnonKey = () => {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (publishable && isSupabaseKey(publishable)) return publishable;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (anon && isSupabaseKey(anon)) return anon;
  return DEV_PLACEHOLDER_ANON;
};

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

/** Client navigateur : session en cookies (compatible middleware admin). Serveur : instance éphémère. */
export const createClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (typeof window === 'undefined') {
    return createSupabaseClient(url, key, {
      auth: { persistSession: false },
    });
  }

  if (supabaseInstance) return supabaseInstance;

  supabaseInstance = createBrowserClient(url, key);
  return supabaseInstance;
};
