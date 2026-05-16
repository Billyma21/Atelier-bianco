import { masamvneProductImageRows } from '@/lib/masamvne-media';
import { whyProductImageRows } from '@/lib/why-media';
import {
  MASAMVNE_DESCRIPTION_FR,
  MASAMVNE_DESCRIPTION_IT,
  MASAMVNE_SHORT_DESC_FR,
  MASAMVNE_SHORT_DESC_IT,
  WHY_DESCRIPTION_FR,
  WHY_DESCRIPTION_IT,
  WHY_SHORT_DESC_FR,
  WHY_SHORT_DESC_IT,
} from '@/lib/brand-copy';

/** Données de démo uniquement si aucun produit en base (slugs connus). */
export function getDemoProduct(slug: string): Record<string, unknown> | undefined {
  const canonical = slug === 'masamune' ? 'masamvne' : slug;
  const mocks: Record<string, Record<string, unknown>> = {
    'mure-iris': {
      id: 'mock-p1',
      name: 'Mûre Iris',
      slug: 'mure-iris',
      family: 'Floral Fruité Poudré',
      description:
        "Une rencontre poétique entre la gourmandise sauvage de la mûre et l'élégance poudrée de l'iris de Florence.",
      long_description: 'Mûre Iris est une fragrance de contrastes...',
      story: "Inspiré par les souvenirs d'enfance...",
      olfactory_notes: [
        { type: 'head', name: 'Mûre Sauvage', image_url: '' },
        { type: 'heart', name: 'Iris de Florence', image_url: '' },
        { type: 'base', name: 'Musc Blanc', image_url: '' },
      ],
      product_images: [
        {
          url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
          is_primary: true,
        },
      ],
      product_variants: [{ id: 'mock-v1', size_ml: 50, price: 125, stock: 0 }],
    },
    'bois-ebene': {
      id: 'mock-p2',
      name: "Bois d'Ébène",
      slug: 'bois-ebene',
      family: 'Boisé Intense',
      description: "Un hommage à la profondeur mystique de l'ébène.",
      product_images: [
        {
          url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
          is_primary: true,
        },
      ],
      product_variants: [{ id: 'mock-v2', size_ml: 100, price: 210, stock: 0 }],
    },
    why: {
      id: 'demo-why',
      name: 'WHY',
      name_it: 'WHY',
      slug: 'why',
      family: 'Extrait de Parfum',
      family_it: 'Estratto di profumo',
      short_desc: WHY_SHORT_DESC_FR,
      description: WHY_DESCRIPTION_FR,
      description_it: WHY_DESCRIPTION_IT,
      short_desc_it: WHY_SHORT_DESC_IT,
      long_description:
        'Fabriqué en Italie. Pyramide : caramel, safran, pêche, fruits rouges ; cœur poivre rose, gingembre, ciste ; fond boisé, vanille, musc, benjoin.',
      story:
        'WHY est une fragrance construite autour de l’inexplicable — une signature élégante, mystérieuse et addictive.',
      story_it:
        'WHY è una fragranza costruita sull’inspiegabile — una firma elegante, misteriosa e avvincente.',
      product_images: whyProductImageRows(),
      product_variants: [
        { id: 'demo-why-50', size_ml: 50, price: 219, stock: 0, sku: 'AB-WHY-50' },
        { id: 'demo-why-100', size_ml: 100, price: 319, stock: 0, sku: 'AB-WHY-100' },
      ],
      olfactory_notes: [
        { type: 'head', name: 'Caramel', name_it: 'Caramello', image_url: '' },
        { type: 'heart', name: 'Poivre rose', name_it: 'Pepe rosa', image_url: '' },
        { type: 'base', name: 'Benjoin', name_it: 'Benzoino', image_url: '' },
      ],
      ingredients:
        'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Benzyl Salicylate, Coumarin, Citronellol, Geraniol, Eugenol, Citral, Benzyl Alcohol, Farnesol.',
      olfactory_profile_title_fr: '¿? — Une présence, pas une réponse',
      olfactory_profile_title_it: '¿? — Una presenza, non una risposta',
      olfactory_profile_description_fr:
        'Tête : caramel, safran, pêche, fruits rouges. Cœur : poivre rose, gingembre, ciste. Fond : notes boisées, vanille, musc, benjoin.',
      olfactory_profile_description_it:
        'Testa: caramello, zafferano, pesca, frutti rossi. Cuore: pepe rosa, zenzero, cisto. Fondo: note legnose, vaniglia, muschio, benzoino.',
      status: 'active',
      is_new: true,
    },
    masamvne: {
      id: 'demo-masamvne',
      name: 'MASAMVNE',
      name_it: 'MASAMVNE',
      slug: 'masamvne',
      family: 'Extrait de Parfum',
      family_it: 'Estratto di profumo',
      short_desc: MASAMVNE_SHORT_DESC_FR,
      description: MASAMVNE_DESCRIPTION_FR,
      description_it: MASAMVNE_DESCRIPTION_IT,
      short_desc_it: MASAMVNE_SHORT_DESC_IT,
      long_description:
        'Fabriqué en Italie. Pyramide : framboise, noix de coco ; cœur caramel, sucre roux, vanille ; fond rose, musc.',
      story:
        'Une lame silencieuse — précise, puissante, maîtrisée. Une signature tranchante qui captive et attire les compliments.',
      story_it:
        'Una lama silenziosa — precisa, potente, controllata. Una firma netta che cattura e attira i complimenti.',
      product_images: masamvneProductImageRows(),
      product_variants: [
        { id: 'demo-ms-50', size_ml: 50, price: 209, stock: 0, sku: 'AB-MASAMVNE-50' },
        { id: 'demo-ms-100', size_ml: 100, price: 299, stock: 0, sku: 'AB-MASAMVNE-100' },
      ],
      olfactory_notes: [
        { type: 'head', name: 'Framboise', name_it: 'Lampone', image_url: '' },
        { type: 'heart', name: 'Caramel', name_it: 'Caramello', image_url: '' },
        { type: 'base', name: 'Rose', name_it: 'Rosa', image_url: '' },
      ],
      olfactory_profile_title_fr: 'La ligne et la matière',
      olfactory_profile_title_it: 'La linea e la materia',
      olfactory_profile_description_fr:
        'Tête : framboise, noix de coco. Cœur : caramel, sucre roux, vanille. Fond : rose, musc.',
      olfactory_profile_description_it:
        'Testa: lampone, cocco. Cuore: caramello, zucchero di canna, vaniglia. Fondo: rosa, muschio.',
      status: 'active',
      is_new: true,
    },
  };
  const row = mocks[canonical];
  if (!row) return undefined;
  if (slug === 'masamune') {
    return { ...row, slug: 'masamune', id: 'demo-masamune-legacy-url' };
  }
  return row;
}
