/**
 * URL canonique du site (SEO, Stripe redirect, metadata, sitemap).
 * Priorité : NEXT_PUBLIC_APP_URL → APP_URL → VERCEL_URL (https) → localhost.
 */
export function getSiteUrl(): string {
  const fromPublic = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromPublic) return fromPublic.replace(/\/$/, '');

  const fromApp = process.env.APP_URL?.trim();
  if (fromApp) return fromApp.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${host}`;
  }

  return 'http://localhost:3000';
}
