import { NextResponse } from 'next/server';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'indisponible' }, { status: 503 });
  }

  let body: { orderId?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!orderId || !email) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const { data: order, error } = await admin
    .from('orders')
    .select('id, status, tracking_number, tracking_carrier, created_at, shipping_address')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const ship = order.shipping_address as { email?: string } | null;
  const orderEmail = ship?.email?.trim().toLowerCase();
  if (!orderEmail || orderEmail !== email) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    tracking_number: order.tracking_number,
    tracking_carrier: order.tracking_carrier,
    created_at: order.created_at,
  });
}
