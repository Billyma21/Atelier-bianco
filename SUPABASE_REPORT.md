# Rapport Supabase — Atelier Bianco

**Date :** 2026-05-15  
**Source :** arborescence `supabase/migrations/` (analyse statique — **pas** de connexion projet live dans cette passe).

---

## Inventaire migrations

Le dépôt contient **30+ fichiers SQL** couvrant notamment :

- Schéma initial produits, variantes, images, commandes, profils (`20240410_initial_schema.sql` et suites).
- Stripe / workflow commandes (`20260420_stripe_events_and_logistics.sql`, `20260422_orders_workflow_statuses.sql`).
- RLS et réconciliations (`20260424140000_rls_reconcile_advisor.sql`, `20240416_fix_order_rls.sql`).
- Catalogue public, collections, signatures marketing (`20260510180000_products_public_select_active.sql`, etc.).
- Consolidation préproduction `20260517120000_consolidation_preproduction.sql`.

---

## Points d’attention techniques

| Sujet | Recommandation |
|-------|----------------|
| **Application des migrations** | Vérifier que **toutes** les migrations sont appliquées sur l’instance prod (`supabase db push` / pipeline CI). |
| **RLS** | Revalider `SELECT/INSERT/UPDATE` pour rôles `anon`, `authenticated`, `service_role` sur `orders`, `product_variants`, `profiles`. |
| **Stock** | Décrément atomique à la confirmation de paiement (webhook Stripe) — éviter race conditions (transaction ou `UPDATE ... WHERE stock >= $n`). |
| **Storage** | Policies sur buckets produits : lecture publique contrôlée, écriture réservée aux rôles admin / service_role. |
| **Indexes** | Index sur `products.slug`, `orders.user_id`, `orders.created_at`, FKs fréquentes — présents dans plusieurs migrations ; revue `EXPLAIN` sur requêtes admin dashboard. |

---

## Auth & Admin

- Rôles métier : combinaison `app_metadata.role`, table `profiles.role`, et liste d’emails dans le middleware client admin (**à harmoniser** — voir SECURITY_REPORT).

---

## Score qualité données (estimation)

**80 / 100** — Schéma riche et itéré ; le risque principal est **l’écart migrations locales / prod**, pas le code Next.

## Actions suivantes

1. Exporter `supabase db lint` ou équivalent si disponible sur le projet.
2. Tester RLS avec comptes test `anon` / `authenticated` sur staging.
3. Vérifier idempotence webhook Stripe ↔ état `orders` (pas de double `paid`).
4. Documenter buckets et paths dans le README interne.
