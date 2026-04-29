import { NextResponse } from 'next/server';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

/** Enregistre un panier abandonné (email optionnel). Table `abandoned_checkouts` requise. */
export async function POST(request: Request) {
  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: { email?: string; cart_snapshot?: unknown; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { error } = await admin.from('abandoned_checkouts').insert({
    email: body.email?.trim() || null,
    cart_snapshot: body.cart_snapshot ?? [],
    locale: body.locale || 'fr',
  });

  if (error) {
    console.warn('[abandon cart]', error.message);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
