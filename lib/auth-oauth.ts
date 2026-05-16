/** Erreurs GoTrue / Supabase : fournisseur OAuth non activé côté projet. */
export function isOauthProviderDisabledError(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  if (m.includes('provider is not enabled')) return true;
  if (m.includes('unsupported provider')) return true;
  if (m.includes('validation_failed') && (m.includes('provider') || m.includes('unsupported'))) return true;
  return false;
}

export const OAUTH_GOOGLE_DISABLED_MESSAGE =
  "Google est configuré dans Google Cloud, mais pas encore activé dans Supabase. Ouvrez Authentication → Providers → Google, activez le fournisseur, puis collez l’ID client et le secret (ceux de Google Cloud). Enregistrez. Vous pouvez utiliser l’e-mail et le mot de passe en attendant.";

/** Lien direct vers l’écran Google du projet Supabase (côté navigateur). */
export function getSupabaseGoogleProviderDashboardUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname;
    const ref = host.split('.')[0];
    if (!ref || ref === 'configure-env') return null;
    return `https://supabase.com/dashboard/project/${ref}/auth/providers?provider=Google`;
  } catch {
    return null;
  }
}
