import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

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

async function sendPaymentReceivedEmail(to: string, orderId: string, amount: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return;
  const from = process.env.RESEND_FROM_EMAIL || 'Atelier Bianco <onboarding@resend.dev>';
  const resend = new Resend(key);
  await resend.emails.send({
    from,
    to,
    subject: 'Atelier Bianco — Paiement confirmé',
    html: `<p style="font-family:Georgia,serif">Merci pour votre commande.</p>
      <p style="font-family:Georgia,serif">Référence : <strong>${orderId.slice(0, 8)}</strong></p>
      <p style="font-family:Georgia,serif">Montant : ${amount}</p>
      <p style="font-family:Georgia,serif;color:#666;font-size:13px">Notre atelier prépare votre envoi avec le plus grand soin.</p>`,
  });
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
        .select('shipping_address, total')
        .eq('id', orderId)
        .single();

      const email =
        session.customer_details?.email ||
        (orderRow?.shipping_address as { email?: string } | null)?.email;
      if (email && orderRow?.total != null) {
        const amount = `${Number(orderRow.total).toFixed(2)} €`;
        await sendPaymentReceivedEmail(email, orderId, amount).catch((err) =>
          console.error('[stripe webhook] resend', err)
        );
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
