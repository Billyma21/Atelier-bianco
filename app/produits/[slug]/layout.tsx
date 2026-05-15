import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import { getSiteUrl } from '@/lib/site-url';
import { APP_LANGUAGE_COOKIE, parseLangCookie } from '@/lib/i18n/constants';
import { normalizeProductSlug } from '@/lib/product-slug';
import {
  productDisplayName,
  productMetaDescription,
  productMetaTitle,
  productPrimaryBody,
} from '@/lib/i18n/db-locale';
import fr from '@/locales/fr.json';
import it from '@/locales/it.json';

type ProductMetaRow = {
  id: string;
  name: string;
  name_it?: string | null;
  name_en?: string | null;
  slug: string;
  description?: string | null;
  description_it?: string | null;
  description_en?: string | null;
  short_desc?: string | null;
  short_desc_it?: string | null;
  short_desc_en?: string | null;
  long_desc?: string | null;
  long_desc_it?: string | null;
  long_desc_en?: string | null;
  meta_title?: string | null;
  meta_title_it?: string | null;
  meta_title_en?: string | null;
  meta_desc?: string | null;
  meta_desc_it?: string | null;
  meta_desc_en?: string | null;
  status?: string | null;
  updated_at?: string | null;
  product_variants?: { size_ml: number; price: number; stock: number }[];
  product_images?: { url: string; position?: number | null }[];
};

async function fetchProductForMetadata(slugParam: string): Promise<ProductMetaRow | null> {
  const admin = tryGetSupabaseAdmin();
  if (!admin) return null;
  const norm = normalizeProductSlug(decodeURIComponent(slugParam));
  const select = `
        id,
        name,
        name_it,
        slug,
        description,
        description_it,
        description_en,
        short_desc,
        short_desc_it,
        short_desc_en,
        long_desc,
        long_desc_it,
        long_desc_en,
        meta_title,
        meta_title_it,
        meta_title_en,
        meta_desc,
        meta_desc_it,
        meta_desc_en,
        status,
        updated_at,
        product_variants ( size_ml, price, stock ),
        product_images ( url, position )
      `;

  let { data } = await admin
    .from('products')
    .select(select)
    .eq('slug', norm)
    .eq('status', 'active')
    .maybeSingle();

  if (!data && norm === 'masamune') {
    const res = await admin
      .from('products')
      .select(select)
      .eq('slug', 'masamvne')
      .eq('status', 'active')
      .maybeSingle();
    data = res.data;
  }

  return data as ProductMetaRow | null;
}

const getCachedProductForPage = cache(fetchProductForMetadata);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const jar = await cookies();
  const lang = parseLangCookie(jar.get(APP_LANGUAGE_COOKIE)?.value);
  const base = getSiteUrl();
  const path = `/produits/${slug}`;
  const product = await getCachedProductForPage(slug);
  const siteCopy = lang === 'it' ? it : fr;

  if (!product) {
    return {
      alternates: { canonical: `${base}${path}` },
      title: siteCopy['meta.title'],
      description: siteCopy['meta.description'],
    };
  }

  const title =
    productMetaTitle(lang, product).trim() ||
    `${productDisplayName(lang, product).trim() || product.name} | Atelier Bianco`;
  const description =
    productMetaDescription(lang, product).trim() ||
    productPrimaryBody(lang, product).trim() ||
    String(siteCopy['meta.description'] ?? '');

  const ogLocale = lang === 'it' ? 'it_IT' : 'fr_FR';
  const alternateLocale = lang === 'it' ? ['fr_FR'] : ['it_IT'];

  return {
    metadataBase: new URL(base),
    title,
    description,
    alternates: { canonical: `${base}${path}` },
    openGraph: {
      title,
      description,
      url: `${base}${path}`,
      siteName: 'Atelier Bianco',
      locale: ogLocale,
      alternateLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

type Props = { children: ReactNode; params: Promise<{ slug: string }> };

export default async function ProductSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const jar = await cookies();
  const lang = parseLangCookie(jar.get(APP_LANGUAGE_COOKIE)?.value);
  const product = await getCachedProductForPage(slug);

  let jsonLd: Record<string, unknown> | null = null;

  if (product) {
    const variants = (product.product_variants || []) as {
      size_ml: number;
      price: number;
      stock: number;
    }[];
    const offers = variants.map((v) => ({
      '@type': 'Offer',
      price: String(v.price),
      priceCurrency: 'EUR',
      availability:
        v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    }));

    const imgs = (product.product_images || []) as { url: string; position?: number | null }[];
    const images = imgs
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((im) => im.url)
      .filter(Boolean);

    const name = productDisplayName(lang, product).trim() || product.name;
    const description =
      productMetaDescription(lang, product).trim() ||
      productPrimaryBody(lang, product).trim() ||
      undefined;

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      sku: product.id,
      image: images.length ? images : undefined,
      brand: { '@type': 'Brand', name: 'Atelier Bianco' },
      offers: offers.length ? offers : undefined,
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
