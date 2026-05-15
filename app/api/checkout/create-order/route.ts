import { NextResponse } from 'next/server';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import type { CartItem } from '@/store/useCart';
import fr from '@/locales/fr.json';
import it from '@/locales/it.json';

export const runtime = 'nodejs';

type ShippingBody = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

type ClientLocale = 'fr' | 'it';

function tOrder(loc: ClientLocale, key: string): string {
  const tab = loc === 'it' ? it : fr;
  const v = tab[key as keyof typeof tab];
  if (typeof v === 'string') return v;
  const f = fr[key as keyof typeof fr];
  return typeof f === 'string' ? f : key;
}

function prepareOrderItems(orderId: string, items: CartItem[], useForeignKeys: boolean) {
  return items.map((item) => ({
    order_id: orderId,
    product_id: useForeignKeys && isUUID(item.id) ? item.id : null,
    variant_id: useForeignKeys && isUUID(item.variantId) ? item.variantId : null,
    quantity: item.quantity,
    unit_price: item.price,
    product_snapshot: item as unknown as Record<string, unknown>,
  }));
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`checkout:${ip}`, 12, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    let locale: ClientLocale = 'fr';
    try {
      const peek = (await request.clone().json()) as { locale?: string };
      if (peek?.locale === 'it') locale = 'it';
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      {
        error: 'server_misconfigured',
        message: tOrder(locale, 'checkout.api.server_misconfigured'),
      },
      { status: 503 }
    );
  }

  let body: {
    items?: CartItem[];
    total?: number;
    shipping?: ShippingBody;
    userId?: string | null;
    locale?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const locale: ClientLocale = body.locale === 'it' ? 'it' : 'fr';

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items_required' }, { status: 400 });
  }

  const expected = items.reduce((acc, i) => acc + Number(i.price) * Number(i.quantity), 0);
  const total = Number(body.total);
  if (!Number.isFinite(total) || total < 0.5 || Math.abs(total - expected) > 0.02) {
    return NextResponse.json(
      { error: 'total_mismatch', message: tOrder(locale, 'checkout.api.total_mismatch') },
      { status: 400 }
    );
  }

  const s = body.shipping;
  if (
    !s?.email?.trim() ||
    !s?.firstName?.trim() ||
    !s?.lastName?.trim() ||
    !s?.address?.trim() ||
    !s?.city?.trim() ||
    !s?.postalCode?.trim()
  ) {
    return NextResponse.json({ error: 'shipping_invalid' }, { status: 400 });
  }

  const orderId = crypto.randomUUID();
  const shippingPayload = {
    email: s.email.trim(),
    phone: s.phone?.trim() || '',
    firstName: s.firstName.trim(),
    lastName: s.lastName.trim(),
    address: s.address.trim(),
    city: s.city.trim(),
    postalCode: s.postalCode.trim(),
    country: s.country?.trim() || 'Belgique',
    payment_method: 'stripe' as const,
    locale,
  };

  let userId = body.userId && isUUID(body.userId) ? body.userId : null;
  if (userId) {
    const { data: profile } = await admin.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!profile) userId = null;
  }

  const fullInsert = {
    id: orderId,
    user_id: userId,
    total,
    status: 'pending' as const,
    shipping_address: shippingPayload,
    payment_method: 'stripe' as const,
    phone: shippingPayload.phone || null,
  };

  let orderError = (await admin.from('orders').insert(fullInsert)).error;

  if (orderError?.code === 'PGRST204') {
    orderError = (
      await admin
        .from('orders')
        .insert({
          id: orderId,
          user_id: userId,
          total,
          status: 'pending',
          shipping_address: shippingPayload,
        })
    ).error;
  }

  if (orderError) {
    return NextResponse.json(
      {
        error: 'order_insert_failed',
        message: orderError.message || tOrder(locale, 'checkout.api.order_insert_failed'),
        code: orderError.code,
      },
      { status: 400 }
    );
  }

  let itemsError = (await admin.from('order_items').insert(prepareOrderItems(orderId, items, true))).error;
  if (itemsError?.code === '23503') {
    itemsError = (await admin.from('order_items').insert(prepareOrderItems(orderId, items, false))).error;
  }

  if (itemsError) {
    await admin.from('orders').delete().eq('id', orderId);
    return NextResponse.json(
      { error: 'order_items_failed', message: itemsError.message, code: itemsError.code },
      { status: 400 }
    );
  }

  return NextResponse.json({ orderId });
}
