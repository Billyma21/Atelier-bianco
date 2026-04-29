/** Pastilles flottantes sur le Hero d’accueil — stockées dans site_settings.home_content.hero_badges */
export type HeroBadgeSlot = 'top-right' | 'bottom-left';
export type HeroBadgeVariant = 'light' | 'dark';

export type HeroBadge = {
  id: string;
  variant: HeroBadgeVariant;
  label: string;
  text: string;
  slot: HeroBadgeSlot;
};

export const DEFAULT_HERO_BADGES: HeroBadge[] = [
  {
    id: 'default-light',
    variant: 'light',
    label: 'Concentration',
    text: "L'Extrait Rare",
    slot: 'top-right',
  },
  {
    id: 'default-dark',
    variant: 'dark',
    label: 'Notes de Coeur',
    text: 'Iris de Florence',
    slot: 'bottom-left',
  },
];

export const DEFAULT_HERO_PRODUCT_IMAGE = '/images/hero-why-atelier-bianco.png';

export function normalizeHeroBadges(raw: unknown): HeroBadge[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HERO_BADGES;
  const out: HeroBadge[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const variant = o.variant === 'dark' ? 'dark' : 'light';
    const slot = o.slot === 'bottom-left' ? 'bottom-left' : 'top-right';
    const label = String(o.label ?? '').trim();
    const text = String(o.text ?? '').trim();
    if (!label && !text) continue;
    out.push({
      id: String(o.id || `badge-${out.length}`),
      variant,
      label: label || '—',
      text: text || '—',
      slot,
    });
  }
  return out.length ? out.slice(0, 6) : DEFAULT_HERO_BADGES;
}
