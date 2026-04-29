import { NextResponse } from 'next/server';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import type { CartItem } from '@/store/useCart';

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
  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        error: 'server_misconfigured',
        message:
          'Enregistrement commande impossible : définissez NEXT_PUBLIC_SUPABASE_URL (projet réel) et SUPABASE_SERVICE_ROLE_KEY sur le serveur (ex. Vercel → Environment Variables).',
      },
      { status: 503 }
    );
  }

  let body: {
    items?: CartItem[];
    total?: number;
    shipping?: ShippingBody;
    userId?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items_required' }, { status: 400 });
  }

  const expected = items.reduce((acc, i) => acc + Number(i.price) * Number(i.quantity), 0);
  const total = Number(body.total);
  if (!Number.isFinite(total) || total < 0.5 || Math.abs(total - expected) > 0.02) {
    return NextResponse.json(
      { error: 'total_mismatch', message: 'Le total ne correspond pas au panier.' },
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
        message: orderError.message || 'Insertion commande refusée.',
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
