import { NextResponse } from 'next/server';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import { clientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`newsletter:${ip}`, 8, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  let body: { email?: string; language?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const language = body.language === 'it' ? 'it' : 'fr';
  const admin = tryGetSupabaseAdmin();

  if (!admin) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.from('newsletter_subscribers').upsert(
    { email, language, is_active: true },
    { onConflict: 'email', ignoreDuplicates: false }
  );

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ ok: true, warning: 'table_missing' });
    }
    console.error('[newsletter]', error.message);
    return NextResponse.json({ error: 'subscribe_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
