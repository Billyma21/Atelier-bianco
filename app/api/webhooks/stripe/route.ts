import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import { sendOrderConfirmationEmail } from '@/lib/email';

export const runtime = 'nodejs';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { typescript: true });
}

async function markEventProcessed(eventId: string, eventType: string): Promise<boolean> {
  const admin = tryGetSupabaseAdmin();
  if (!admin) return false;
  const { error } = await admin.from('stripe_events').insert({ id: eventId, type: eventType });
  if (error?.code === '23505') return false;
  if (error) throw new Error(error.message);
  return true;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripe = getStripe();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook non configuré' }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signature invalide';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Base de données admin indisponible' }, { status: 503 });
  }

  let shouldProcess = false;
  try {
    shouldProcess = await markEventProcessed(event.id, event.type);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur idempotence';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!shouldProcess) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  const rollbackEvent = async () => {
    await admin.from('stripe_events').delete().eq('id', event.id);
  };

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId =
        session.metadata?.order_id ||
        session.metadata?.orderId ||
        session.client_reference_id ||
        null;

      if (!orderId) {
        return NextResponse.json({ received: true, warning: 'no_order_in_metadata' });
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || null;

      const { error: updError } = await admin
        .from('orders')
        .update({
          status: 'processing',
          stripe_payment_intent: paymentIntentId,
          stripe_checkout_session_id: session.id,
        })
        .eq('id', orderId);

      if (updError) {
        console.error('[stripe webhook] order update', updError);
        await rollbackEvent();
        return NextResponse.json({ error: updError.message }, { status: 500 });
      }

      const { data: orderRow } = await admin
        .from('orders')
        .select('total, shipping_address')
        .eq('id', orderId)
        .maybeSingle();

      const ship = orderRow?.shipping_address as { email?: string; locale?: string } | null;
      const customerEmail =
        session.customer_details?.email?.trim() ||
        session.customer_email?.trim() ||
        ship?.email?.trim();

      if (customerEmail && orderRow?.total != null) {
        const locale = ship?.locale === 'it' ? 'it' : 'fr';
        await sendOrderConfirmationEmail({
          to: customerEmail,
          orderId,
          total: Number(orderRow.total),
          locale,
        });
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId =
        session.metadata?.order_id ||
        session.metadata?.orderId ||
        session.client_reference_id;
      if (orderId) {
        await admin
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)
          .eq('status', 'pending');
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.order_id || pi.metadata?.orderId;
      if (orderId) {
        await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId).eq('status', 'pending');
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur traitement';
    console.error('[stripe webhook]', err);
    await admin.from('stripe_events').delete().eq('id', event.id);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
