/** Types de visuels olfactifs — une ligne par kind et par produit (contrainte UNIQUE). */
export const OLFACTORY_VISUAL_KINDS = ['story_panel', 'pyramid_diagram'] as const;
export type OlfactoryVisualKind = (typeof OLFACTORY_VISUAL_KINDS)[number];

export type OlfactoryVisualRow = {
  id?: string;
  product_id?: string;
  kind: OlfactoryVisualKind;
  image_url: string;
  caption_fr?: string | null;
  caption_it?: string | null;
  alt_fr?: string | null;
  alt_it?: string | null;
  sort_order?: number;
};

export function mapVisualsByKind(rows: OlfactoryVisualRow[] | null | undefined) {
  const out: Partial<Record<OlfactoryVisualKind, OlfactoryVisualRow>> = {};
  for (const r of rows || []) {
    if (r.kind === 'story_panel' || r.kind === 'pyramid_diagram') {
      out[r.kind] = r;
    }
  }
  return out;
}
