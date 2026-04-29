-- Statuts de commande enrichis (paiement en attente, attente stock, remboursement explicite)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending',
    'awaiting_payment',
    'processing',
    'on_hold',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  )
);

COMMENT ON COLUMN public.orders.status IS
  'pending: créée | awaiting_payment: en attente règlement | processing: préparation | on_hold: attente réappro | shipped | delivered | cancelled | refunded';
