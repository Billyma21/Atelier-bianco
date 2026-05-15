# TODO final — mise en production Atelier Bianco

**Date :** 2026-05-15  
Liste synthétique post-audit. **Aucune entrée bloquante implicite** : classer par priorité métier.

---

## P0 — Avant ouverture au public

- [ ] Appliquer **toutes** les migrations Supabase sur l’environnement production.
- [ ] Configurer **variables Vercel** : `NEXT_PUBLIC_APP_URL`, Supabase, Stripe (`STRIPE_WEBHOOK_SECRET` prod).
- [ ] Tester **un paiement réel** (petit montant) : commande → webhook → statut → email.
- [ ] Renseigner `NEXT_PUBLIC_SOCIAL_*` ou accepter l’absence d’icônes réseaux.
- [ ] Retirer / feature-flag **`bootstrapAdmin`** en production ou restreindre par IP.
- [ ] Remplacer les **emails admin en dur** dans `admin/(dashboard)/layout.tsx` par configuration.

## P1 — Semaine 1 post-lancement

- [ ] Implémenter **wishlist** et **adresses sauvegardées** (remplacer les pages stub).
- [ ] Page **contact** ou formulaire dédié (au-delà de FAQ + `report-site-issue`).
- [ ] **Schema.org** `Product` / `Organization` sur fiche produit et layout (SEO).
- [ ] Remplacer `<img>` admin par **`next/image`** (collections, parfumeurs).
- [ ] Corriger **warnings** `react-hooks/exhaustive-deps` (commandes, parfumeurs).

## P2 — Qualité & conversion luxe

- [ ] Revue **microcopy** bilingue FR/IT sur checkout et erreurs toast.
- [ ] **Abandoned cart** : vérifier cron / endpoint et conformité RGPD email.
- [ ] Afficher **vraies variations** (+/- %) sur dashboard quand historique suffisant.
- [ ] Notifications admin : badge **« 3 »** factice dans le header — brancher compteur réel ou masquer.

## P3 — Performance & tests

- [ ] Lighthouse CI mobile sur `/`, `/parfums`, `/produits/[slug]`, `/checkout`.
- [ ] **Playwright** : parcours commande + compte + admin smoke.
- [ ] Dynamic import **Recharts** sur dashboard admin.

## P4 — Légal & fiscalité

- [ ] Valider textes **CGV / TVA Belgique** avec conseil juridique.
- [ ] Politique de **remboursement** et délais alignés Stripe.

---

## Suivi

- Rapports détaillés : `AUDIT_REPORT.md`, `RESPONSIVE_REPORT.md`, `SECURITY_REPORT.md`, `PERFORMANCE_REPORT.md`, `SUPABASE_REPORT.md`.
- Commande de santé : `npm run build` (obligatoire avant chaque release).

---

**Dernière exécution build :** OK (2026-05-15) — `exit code 0`.  
**ESLint :** 0 erreurs, 4 avertissements (voir PERFORMANCE_REPORT).
