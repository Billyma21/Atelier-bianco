import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';

function publicBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.APP_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const base = publicBaseUrl();
  return {
    alternates: { canonical: `${base}/produits/${slug}` },
  };
}

type Props = { children: ReactNode; params: Promise<{ slug: string }> };

export default async function ProductSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const admin = tryGetSupabaseAdmin();

  let jsonLd: Record<string, unknown> | null = null;

  if (admin) {
    const { data: product } = await admin
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        description,
        status,
        updated_at,
        product_variants ( size_ml, price, stock ),
        product_images ( url, position )
      `
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

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

      const imgs = (product.product_images || []) as { url: string }[];
      const images = imgs.map((im) => im.url).filter(Boolean);

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || undefined,
        sku: product.id,
        image: images.length ? images : undefined,
        brand: { '@type': 'Brand', name: 'Atelier Bianco' },
        offers: offers.length ? offers : undefined,
      };
    }
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
