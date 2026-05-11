/** Erreurs GoTrue / Supabase : fournisseur OAuth non activé côté projet. */
export function isOauthProviderDisabledError(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return true;
  if (m.includes('validation_failed') && (m.includes('provider') || m.includes('unsupported'))) return true;
  return false;
}

export const OAUTH_GOOGLE_DISABLED_MESSAGE =
  "La connexion Google n'est pas activée sur le projet Supabase. Ouvrez le dashboard : Authentication → Providers → Google, puis renseignez l'ID client et le secret Google Cloud. Vous pouvez vous connecter avec email et mot de passe en attendant.";
