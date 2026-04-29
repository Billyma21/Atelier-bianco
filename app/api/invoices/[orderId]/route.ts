import { NextRequest, NextResponse } from 'next/server';
import { tryGetSupabaseAdmin } from '@/lib/supabase-admin';
import { renderOrderInvoiceBuffer } from '@/lib/invoice/renderOrderInvoice';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 });
  }

  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'indisponible' }, { status: 503 });
  }

  const { data: order, error } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const ship = order.shipping_address as { email?: string } | null;
  if (!ship?.email || ship.email.trim().toLowerCase() !== email) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const items = order.order_items || [];
  const buffer = await renderOrderInvoiceBuffer(order, items);
  const bytes = new Uint8Array(buffer);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="atelier-bianco-${orderId.slice(0, 8)}.pdf"`,
    },
  });
}
