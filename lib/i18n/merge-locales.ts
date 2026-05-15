import fr from '@/locales/fr.json';
import it from '@/locales/it.json';

export type ClientLocaleJson = Record<string, string>;

export type TranslationData = {
  [key: string]: {
    fr: string;
    it: string;
  };
};

/**
 * Fusionne deux fichiers plats (mêmes clés) en structure { key: { fr, it } }.
 * Fallback croisé si une langue manque pour une clé.
 */
export function mergeLocaleFiles(frObj: ClientLocaleJson, itObj: ClientLocaleJson): TranslationData {
  const keys = new Set([...Object.keys(frObj), ...Object.keys(itObj)]);
  const out: TranslationData = {};
  for (const key of keys) {
    const fv = frObj[key];
    const iv = itObj[key];
    out[key] = {
      fr: fv ?? iv ?? key,
      it: iv ?? fv ?? key,
    };
  }
  return out;
}

export const CLIENT_LOCALE_MERGED = mergeLocaleFiles(fr as ClientLocaleJson, it as ClientLocaleJson);
