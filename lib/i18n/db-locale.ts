import type { AppLanguage } from '@/lib/i18n/constants';

/** Champs texte produit côté Supabase (sous-ensemble typé). */
export type ProductLocaleFields = {
  description?: string | null;
  description_it?: string | null;
  description_en?: string | null;
  short_desc?: string | null;
  short_desc_it?: string | null;
  short_desc_en?: string | null;
  long_desc?: string | null;
  long_desc_it?: string | null;
  long_desc_en?: string | null;
  story?: string | null;
  story_it?: string | null;
  story_en?: string | null;
  meta_title?: string | null;
  meta_title_it?: string | null;
  meta_title_en?: string | null;
  meta_desc?: string | null;
  meta_desc_it?: string | null;
  meta_desc_en?: string | null;
  name?: string | null;
  name_it?: string | null;
  name_en?: string | null;
  family?: string | null;
  family_it?: string | null;
  family_en?: string | null;
};

export type CollectionLocaleFields = {
  description?: string | null;
  description_it?: string | null;
  description_en?: string | null;
};

export type OlfactoryVisualTextFields = {
  caption_fr?: string | null;
  caption_it?: string | null;
  caption_en?: string | null;
  alt_fr?: string | null;
  alt_it?: string | null;
  alt_en?: string | null;
};

function pickFirst(...vals: Array<string | null | undefined>): string {
  for (const v of vals) {
    const s = (v ?? '').trim();
    if (s) return s;
  }
  return '';
}

/**
 * Corps principal fiche produit : italien sans repli vers le français.
 */
export function productPrimaryBody(lang: AppLanguage, p: ProductLocaleFields): string {
  if (lang === 'it') {
    return pickFirst(
      p.description_it,
      p.short_desc_it,
      p.long_desc_it,
      p.description_en,
      p.short_desc_en,
      p.long_desc_en
    );
  }
  return pickFirst(
    p.description,
    p.short_desc,
    p.long_desc,
    p.description_it,
    p.short_desc_it
  );
}

export function productStoryBlock(lang: AppLanguage, p: ProductLocaleFields): string {
  if (lang === 'it') return pickFirst(p.story_it, p.story_en);
  return pickFirst(p.story, p.story_it);
}

/**
 * Nom affiché : en italien, pas de repli vers le catalogue français.
 */
export function productDisplayName(lang: AppLanguage, p: Pick<ProductLocaleFields, 'name' | 'name_it' | 'name_en'>): string {
  if (lang === 'it') return pickFirst(p.name_it, p.name_en);
  return pickFirst(p.name, p.name_it);
}

export function productDisplayFamily(
  lang: AppLanguage,
  p: Pick<ProductLocaleFields, 'family' | 'family_it' | 'family_en'>
): string {
  if (lang === 'it') return pickFirst(p.family_it, p.family_en);
  return pickFirst(p.family, p.family_it);
}

export function productMetaTitle(lang: AppLanguage, p: ProductLocaleFields): string {
  if (lang === 'it') return pickFirst(p.meta_title_it, p.meta_title_en);
  return pickFirst(p.meta_title, p.meta_title_it);
}

export function productMetaDescription(lang: AppLanguage, p: ProductLocaleFields): string {
  if (lang === 'it') {
    return pickFirst(
      p.meta_desc_it,
      p.meta_desc_en,
      p.short_desc_it,
      p.long_desc_it,
      p.description_en,
      p.short_desc_en
    );
  }
  return pickFirst(p.meta_desc, p.meta_desc_it, p.short_desc, p.description);
}

/** Accroche courte (accueil, grilles) — pas de fuite FR → IT. */
export function productCardBlurb(lang: AppLanguage, p: ProductLocaleFields, maxLen = 320): string {
  const text =
    lang === 'it'
      ? pickFirst(p.short_desc_it, p.description_it, p.short_desc_en, p.description_en)
      : pickFirst(p.short_desc, p.description, p.short_desc_it, p.description_it);
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

export function collectionMarketingBody(lang: AppLanguage, c: CollectionLocaleFields): string {
  if (lang === 'it') return pickFirst(c.description_it, c.description_en);
  return pickFirst(c.description, c.description_it);
}

export function dbVisualCaption(lang: AppLanguage, v: OlfactoryVisualTextFields): string {
  if (lang === 'it') return pickFirst(v.caption_it, v.caption_en);
  return pickFirst(v.caption_fr, v.caption_it);
}

export function dbVisualAlt(lang: AppLanguage, v: OlfactoryVisualTextFields): string {
  if (lang === 'it') return pickFirst(v.alt_it, v.alt_en);
  return pickFirst(v.alt_fr, v.alt_it);
}
