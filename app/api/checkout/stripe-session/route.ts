import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

function appBaseUrl() {
  return (
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json(
      {
        error: 'stripe_not_configured',
        message: 'Variable STRIPE_SECRET_KEY manquante sur le serveur.',
      },
      { status: 503 }
    );
  }

  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        error: 'server_misconfigured',
        message: 'Clé SUPABASE_SERVICE_ROLE_KEY manquante : le serveur ne peut pas lire la commande pour Stripe.',
      },
      { status: 503 }
    );
  }

  let body: { orderId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ error: 'orderId_required' }, { status: 400 });
  }

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('id, status, total, shipping_address')
    .eq('id', orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: 'order_not_found', message: orderErr?.message || 'Commande introuvable côté serveur.' },
      { status: 404 }
    );
  }

  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'order_not_pending' }, { status: 409 });
  }

  const { data: items, error: itemsErr } = await admin
    .from('order_items')
    .select('quantity, unit_price, product_snapshot')
    .eq('order_id', orderId);

  if (itemsErr || !items?.length) {
    return NextResponse.json(
      { error: 'order_items_missing', message: itemsErr?.message || 'Aucune ligne de commande.' },
      { status: 400 }
    );
  }

  const stripe = new Stripe(secret, { typescript: true });
  const base = appBaseUrl();

  const line_items: Array<{
    quantity: number;
    price_data: {
      currency: 'eur';
      unit_amount: number;
      product_data: { name: string };
    };
  }> = [];
  for (const row of items) {
    const snap = row.product_snapshot as { name?: string } | null;
    const name = (snap?.name || 'Création Atelier Bianco').slice(0, 120);
    const qty = Math.max(1, Math.floor(Number(row.quantity) || 1));
    const unit = Math.round(Number(row.unit_price) * 100);
    if (!Number.isFinite(unit) || unit < 50) {
      return NextResponse.json(
        {
          error: 'invalid_line_amount',
          message: `Montant ligne invalide pour « ${name} » (minimum 0,50 €).`,
        },
        { status: 400 }
      );
    }
    line_items.push({
      quantity: qty,
      price_data: {
        currency: 'eur',
        unit_amount: unit,
        product_data: { name },
      },
    });
  }

  const customerEmail =
    (order.shipping_address as { email?: string } | null)?.email || undefined;

  let session: { id: string; url: string | null };
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: orderId,
      metadata: { order_id: orderId },
      payment_intent_data: {
        metadata: { order_id: orderId },
      },
      line_items,
      success_url: `${base}/confirmation/${orderId}?paid=1`,
      cancel_url: `${base}/checkout`,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur Stripe';
    console.error('[stripe-session]', e);
    return NextResponse.json({ error: 'stripe_create_failed', message: msg }, { status: 502 });
  }

  const { error: upErr } = await admin
    .from('orders')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', orderId);
  if (upErr) {
    console.warn('[stripe-session] impossible d\'enregistrer stripe_checkout_session_id:', upErr.message);
  }

  if (!session.url) {
    return NextResponse.json({ error: 'no_session_url', message: 'Stripe n\'a pas renvoyé d\'URL.' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
