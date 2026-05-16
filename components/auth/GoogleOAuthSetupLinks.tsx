'use client';

import { getSupabaseGoogleProviderDashboardUrl } from '@/lib/auth-oauth';
import { useLanguage } from '@/context/LanguageContext';

type Props = {
  showGoogleCloudHint?: boolean;
};

export default function GoogleOAuthSetupLinks({ showGoogleCloudHint = true }: Props) {
  const { t } = useLanguage();
  const supabaseUrl = getSupabaseGoogleProviderDashboardUrl();
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? (() => {
        try {
          return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
        } catch {
          return null;
        }
      })()
    : null;

  if (!supabaseUrl) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-red-100 pt-3 text-[10px] leading-relaxed text-red-600/90">
      <p className="font-medium uppercase tracking-widest text-red-700/80">
        {t('auth.oauth_setup_steps_title', 'Étapes dans Supabase (obligatoire)')}
      </p>
      <ol className="list-decimal space-y-1 pl-4">
        <li>
          <a
            href={supabaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-gold underline underline-offset-2"
          >
            {t('auth.open_supabase_google', 'Ouvrir Google dans Supabase')}
          </a>
          {' — '}
          {t('auth.oauth_step_enable', 'activer le fournisseur, coller Client ID + Secret, enregistrer.')}
        </li>
        <li>
          {t('auth.oauth_step_urls', 'Authentication → URL Configuration :')}{' '}
          <span className="font-mono text-[9px]">http://localhost:3000/auth/callback</span>
        </li>
      </ol>
      {showGoogleCloudHint && supabaseHost ? (
        <p className="text-red-600/75">
          {t('auth.oauth_google_redirect', 'Dans Google Cloud, URI de redirection :')}{' '}
          <span className="break-all font-mono text-[9px]">{supabaseHost}/auth/v1/callback</span>
        </p>
      ) : null}
    </div>
  );
}
