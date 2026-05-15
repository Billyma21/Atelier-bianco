import type { AppLanguage } from '@/lib/i18n/constants';

/**
 * Texte dynamique (CMS / DB) : en italien, ne renvoie jamais la variante française.
 */
export function localizedText(
  lang: AppLanguage,
  frValue: string | null | undefined,
  itValue: string | null | undefined
): string {
  const fr = (frValue ?? '').trim();
  const it = (itValue ?? '').trim();
  if (lang === 'it') return it;
  return fr || it;
}
