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

/** Par défaut : aucune pastille flottante (évite le doublon « Concentration / Extrait » sur le packshot). */
export const DEFAULT_HERO_BADGES: HeroBadge[] = [];

/** Packshot studio (hero colonne droite par défaut). */
export const DEFAULT_HERO_PRODUCT_IMAGE = '/images/hero-why-studio.png';

/** Visuel lifestyle / storytelling — stocké en base (`home_content.hero_image`). */
export const DEFAULT_HERO_SECONDARY_IMAGE = '/images/hero-why-lifestyle.png';

/** Pastille « Concentration » : sous-texte toujours « Extrait » (écrase l’ancien « L'Extrait Rare » venant de Supabase). */
function migrateLegacyBadgeCopy(b: HeroBadge): HeroBadge {
  const lab = b.label.trim().toLowerCase().replace(/\s+/g, ' ');
  if (lab === 'concentration') {
    return { ...b, text: 'Extrait' };
  }
  return b;
}

export function normalizeHeroBadges(raw: unknown): HeroBadge[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }
  const out: HeroBadge[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const variant = o.variant === 'dark' ? 'dark' : 'light';
    const slot = o.slot === 'bottom-left' ? 'bottom-left' : 'top-right';
    const label = String(o.label ?? '').trim();
    const text = String(o.text ?? '').trim();
    if (!label && !text) continue;
    out.push(
      migrateLegacyBadgeCopy({
        id: String(o.id || `badge-${out.length}`),
        variant,
        label: label || '—',
        text: text || '—',
        slot,
      })
    );
  }
  const list = out.length ? out.slice(0, 6) : DEFAULT_HERO_BADGES.map((x) => ({ ...x }));
  return list.map(migrateLegacyBadgeCopy).map(finalizeConcentrationBadge);
}

/** La pastille claire en haut à droite est toujours « Concentration » / « Extrait » (cœur = autre slot). */
function finalizeConcentrationBadge(b: HeroBadge): HeroBadge {
  if (b.variant === 'light' && b.slot === 'top-right') {
    const label = b.label?.trim() && b.label.trim() !== '—' ? b.label.trim() : 'Concentration';
    return { ...b, label, text: 'Extrait' };
  }
  return b;
}
