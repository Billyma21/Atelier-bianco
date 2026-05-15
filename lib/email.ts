import { getSiteUrl } from '@/lib/site-url';
import fr from '@/locales/fr.json';
import it from '@/locales/it.json';

type SendResult = { ok: boolean; skipped?: boolean; error?: string };

export type ClientEmailLocale = 'fr' | 'it';

function pick(locale: ClientEmailLocale | undefined) {
  return locale === 'it' ? it : fr;
}

function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

async function sendResend(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, skipped: true };

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || 'Atelier Bianco <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, error: text || res.statusText };
  }
  return { ok: true };
}

export async function sendOrderConfirmationEmail(opts: {
  to: string;
  orderId: string;
  total: number;
  currency?: string;
  locale?: ClientEmailLocale;
}): Promise<SendResult> {
  if (!resendConfigured()) return { ok: false, skipped: true };

  const L = pick(opts.locale);
  const site = getSiteUrl();
  const locStr = opts.locale === 'it' ? 'it-IT' : 'fr-BE';
  const totalFmt = new Intl.NumberFormat(locStr, {
    style: 'currency',
    currency: opts.currency || 'EUR',
  }).format(opts.total);

  const subject = L['email.order_confirm.subject'];
  const title = L['email.order_confirm.title'];
  const line1 = L['email.order_confirm.line1'].replace('{id}', opts.orderId.slice(0, 8).toUpperCase());
  const amountLabel = L['email.order_confirm.amount'].replace('{amount}', totalFmt);
  const cta = L['email.order_confirm.cta'];

  return sendResend({
    to: opts.to,
    subject,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #b8955a;">Atelier Bianco</p>
        <h1 style="font-size: 24px; font-weight: normal;">${title}</h1>
        <p style="font-size: 14px; line-height: 1.6;">${line1}</p>
        <p style="font-size: 14px;">${amountLabel}</p>
        <p style="margin-top: 24px;">
          <a href="${site}/suivi" style="color: #1a1a1a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em;">${cta}</a>
        </p>
      </div>
    `,
  });
}

export async function sendStockAlertEmail(opts: {
  to: string;
  productName: string;
  sizeMl?: number;
  locale?: ClientEmailLocale;
}): Promise<SendResult> {
  if (!resendConfigured()) return { ok: false, skipped: true };

  const L = pick(opts.locale);
  const site = getSiteUrl();
  const size = opts.sizeMl ? ` (${opts.sizeMl} ml)` : '';

  const subject = L['email.stock.subject'].replace('{name}', opts.productName).replace('{size}', size);
  const title = L['email.stock.title'];
  const line = L['email.stock.line'].replace('{name}', opts.productName).replace('{size}', size);
  const cta = L['email.stock.cta'];

  return sendResend({
    to: opts.to,
    subject,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto;">
        <h1 style="font-size: 22px; font-weight: normal;">${title}</h1>
        <p>${line}</p>
        <p><a href="${site}/parfums">${cta}</a></p>
      </div>
    `,
  });
}
