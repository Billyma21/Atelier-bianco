import type { SupabaseClient } from '@supabase/supabase-js';

const PRODUCT_EMBED_FULL = `product_collections(
  collection_id,
  collections(id,name,name_it,slug,sort_order)
)`;

const PRODUCT_EMBED_LEGACY = `product_collections(
  collection_id,
  collections(id,name,slug)
)`;

/** Produits actifs + relations ; repli si la table `collections` n’a pas encore les colonnes catalogue (migrations non appliquées). */
export async function fetchActiveProductsCatalog(client: SupabaseClient) {
  const fullSelect = `*, product_images(*), product_variants(*), ${PRODUCT_EMBED_FULL}`;
  const legacySelect = `*, product_images(*), product_variants(*), ${PRODUCT_EMBED_LEGACY}`;

  const res = await client
    .from('products')
    .select(fullSelect)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (!res.error) return res;

  // Schéma sans colonnes enrichies sur `collections` : deuxième essai sans name_it / sort_order dans l’embed.
  const fallback = await client
    .from('products')
    .select(legacySelect)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (!fallback.error) return fallback;

  return res;
}

/** Collections publiées pour le site ; plusieurs niveaux de repli selon le schéma réel. */
export async function fetchPublishedCollectionsCompat(client: SupabaseClient) {
  const q1 = await client
    .from('collections')
    .select('id,name,name_it,slug,sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (!q1.error) return q1;

  const q2 = await client
    .from('collections')
    .select('id,name,name_it,slug,sort_order')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (!q2.error) return q2;

  return client.from('collections').select('id,name,slug').order('name', { ascending: true });
}
