import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { formatPrice } from '@/lib/utils';

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
  brand: { fontSize: 22, letterSpacing: 2, marginBottom: 6 },
  gold: { fontSize: 9, color: '#8a7349', letterSpacing: 3, marginBottom: 28 },
  h: { fontSize: 11, marginBottom: 8, fontFamily: 'Helvetica-Bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  line: { borderBottomWidth: 1, borderBottomColor: '#e8e4dc', marginVertical: 12 },
  total: { fontSize: 14, marginTop: 16, fontFamily: 'Helvetica-Bold' },
  footer: { marginTop: 40, fontSize: 8, color: '#666', lineHeight: 1.5 },
});

function InvoiceDocument({ order, items }: { order: Record<string, unknown>; items: any[] }) {
  const ship = order.shipping_address as Record<string, string> | null;
  const total = Number(order.total);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>ATELIER BIANCO</Text>
        <Text style={styles.gold}>HAUTE PARFUMERIE</Text>
        <Text style={styles.h}>Facture</Text>
        <View style={styles.row}>
          <Text>Référence</Text>
          <Text>{String(order.id).slice(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text>Date</Text>
          <Text>{new Date(String(order.created_at)).toLocaleDateString('fr-FR')}</Text>
        </View>
        <View style={styles.line} />
        <Text style={styles.h}>Client</Text>
        {ship && (
          <>
            <Text>
              {ship.firstName} {ship.lastName}
            </Text>
            <Text>{ship.email}</Text>
            <Text style={{ marginTop: 6 }}>
              {ship.address}, {ship.postalCode} {ship.city}
            </Text>
            <Text>{ship.country}</Text>
          </>
        )}
        <View style={styles.line} />
        <Text style={styles.h}>Détail</Text>
        {items.map((it) => {
          const snap = it.product_snapshot as { name?: string; size?: string } | null;
          const name = snap?.name || 'Article';
          const line = Number(it.unit_price) * Number(it.quantity);
          return (
            <View key={it.id} style={styles.row}>
              <Text style={{ maxWidth: '70%' }}>
                {name} × {it.quantity}
              </Text>
              <Text>{formatPrice(line)}</Text>
            </View>
          );
        })}
        <View style={styles.line} />
        <View style={styles.row}>
          <Text style={styles.total}>Total TTC</Text>
          <Text style={styles.total}>{formatPrice(total)}</Text>
        </View>
        <Text style={styles.footer}>
          Atelier Bianco — Maison de parfum. TVA selon réglementation en vigueur au moment de la commande.
          Document généré à titre de justificatif commercial.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderOrderInvoiceBuffer(
  order: Record<string, unknown>,
  items: any[]
): Promise<Buffer> {
  const instance = pdf(<InvoiceDocument order={order} items={items} />);
  const out = await instance.toBuffer();
  if (Buffer.isBuffer(out)) return out;
  if (out instanceof Uint8Array) return Buffer.from(out);

  const arrayBuffer = await new Response(out as unknown as ReadableStream).arrayBuffer();
  return Buffer.from(arrayBuffer);
}
