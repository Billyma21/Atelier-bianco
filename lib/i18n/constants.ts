/** Cookie lu côté serveur pour `<html lang>` et métadonnées. */
export const APP_LANGUAGE_COOKIE = 'app-language';

export type AppLanguage = 'fr' | 'it';

export function parseLangCookie(value: string | undefined): AppLanguage {
  return value === 'it' ? 'it' : 'fr';
}
