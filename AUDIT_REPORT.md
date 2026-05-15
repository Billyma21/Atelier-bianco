# Audit Atelier Bianco — rapport de production

Date : 2026-05-17  
Stack : Next.js 16 (App Router) · Supabase · Stripe · Zustand · FR/IT

---

## Phase 0 — Cartographie des routes

### Routes publiques (existantes)

| URL | Fichier | Statut |
|-----|---------|--------|
| `/` | `app/page.tsx` | OK |
| `/parfums` | `app/parfums/page.tsx` | OK |
| `/produits/[slug]` | `app/produits/[slug]/page.tsx` | OK |
| `/la-maison` | `app/la-maison/page.tsx` | OK |
| `/faq` | `app/faq/page.tsx` | OK |
| `/panier` | `app/panier/page.tsx` | OK |
| `/checkout` | `app/checkout/page.tsx` | OK |
| `/confirmation/[orderId]` | `app/confirmation/[orderId]/page.tsx` | OK (pas `/confirmation?session_id=`) |
| `/suivi` | `app/suivi/page.tsx` | OK |
| `/mentions-legales` | `app/mentions-legales/page.tsx` | OK |
| `/cgv` | `app/cgv/page.tsx` | OK |
| `/confidentialite` | `app/confidentialite/page.tsx` | OK |

### Auth

| URL | Fichier | Statut |
|-----|---------|--------|
| `/auth/login` | `app/auth/login/page.tsx` | OK |
| `/auth/register` | `app/auth/register/page.tsx` | OK |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | **Créé** (manquait) |
| `/auth/callback` | `app/auth/callback/route.ts` | OK |
| `/auth/auth-code-error` | `app/auth/auth-code-error/page.tsx` | OK |

### Espace client

| URL | Fichier | Statut |
|-----|---------|--------|
| `/mon-compte` | `app/mon-compte/page.tsx` | OK + middleware |
| `/mon-compte/commandes` | `app/mon-compte/commandes/page.tsx` | OK + middleware |

### Admin (chemins réels ≠ spec initiale)

| Spec audit | Route réelle | Fichier |
|------------|--------------|---------|
| `/admin/dashboard` | **`/admin`** | `app/admin/(dashboard)/page.tsx` |
| `/admin/avis` | **`/admin/reviews`** | `app/admin/(dashboard)/reviews/page.tsx` |
| `/admin/parfumeurs` | **`/admin/perfumers`** | `app/admin/(dashboard)/perfumers/page.tsx` |
| `/admin/produits/new` | **modal sur `/admin/produits`** | pas de route dédiée |
| `/admin/produits/[id]` | **modal sur `/admin/produits`** | pas de route dédiée |
| `/admin/commandes/[id]` | **modal / détail inline** | pas de route dédiée |

### API

| Route | Fichier | Statut |
|-------|---------|--------|
| `GET /api/catalog` | `app/api/catalog/route.ts` | OK |
| `GET /api/collections` | `app/api/collections/route.ts` | OK |
| `POST /api/checkout/create-order` | `app/api/checkout/create-order/route.ts` | OK (≠ `POST /api/checkout` unique) |
| `POST /api/checkout/stripe-session` | `app/api/checkout/stripe-session/route.ts` | OK |
| `POST /api/webhooks/stripe` | `app/api/webhooks/stripe/route.ts` | OK |
| `GET /api/invoices/[orderId]` | `app/api/invoices/[orderId]/route.ts` | OK |
| `POST /api/orders/track` | `app/api/orders/track/route.ts` | OK |
| `POST /api/cart/abandon` | `app/api/cart/abandon/route.ts` | OK |
| `POST /api/newsletter` | `app/api/newsletter/route.ts` | **Créé** |
| `POST /api/report-site-issue` | `app/api/report-site-issue/route.ts` | OK |

**Liens internes** : aucun `href` ne pointe vers une route totalement absente après création de `/auth/forgot-password`.

---

## Phase 1 — Parcours utilisateur

### Corrections appliquées

| Criticité | Problème | Correction |
|-----------|----------|--------------|
| 🔴 | `/auth/forgot-password` absent | Page + lien depuis login |
| 🔴 | Middleware admin vide (`NextResponse.next()`) | Protection `/admin/*` (sauf login) via cookies Supabase |
| 🟠 | Auth client en localStorage seul | `createBrowserClient` (@supabase/ssr) pour sessions cookies |
| 🟠 | Newsletter footer sans handler | `POST /api/newsletter` + formulaire Footer |
| 🟠 | `/mon-compte` non protégé serveur | Redirect middleware si non connecté |
| 🟡 | Recherche sans filtre `active` | `SearchModal` : `.eq('status','active')` + sanitization requête |
| 🟡 | Email admin uniquement `bilyma21@gmail.com` | Ajout `kenzy@ab.be` + `NEXT_PUBLIC_ADMIN_BOOTSTRAP_EMAIL` |

### Écarts connus (non bloquants build)

- **Catalogue** : pas de pagination / infinite scroll ; filtres famille avancés partiels.
- **Fiche produit** : pas de `generateStaticParams` ni `notFound()` serveur (page client).
- **Confirmation** : par `orderId` dans l’URL, pas relecture Stripe `session_id` côté client.
- **Schema.org Product** : non implémenté.
- **Rate limiting** API : non implémenté (recommandé Vercel / edge).

---

## Phase 2 — Admin

- Protection **middleware** + garde existante dans `app/admin/(dashboard)/layout.tsx`.
- CRUD produits / collections : **page unique avec modales** (choix d’architecture conservé).
- Factures : `GET /api/invoices/[orderId]` (vérifier rôle admin côté route avant prod).

---

## Phase 3 — Base de données

Migration ajoutée :  
`supabase/migrations/20260517120000_consolidation_preproduction.sql`

- Table `newsletter_subscribers` + RLS
- Index performance (products, orders, images, notes)
- `UNIQUE` collections.slug, perfumers.name
- RLS `wishlists`, `addresses`, `promo_codes` (lecture active)

**À exécuter** sur le projet Supabase : `npm run supabase:push` ou dashboard SQL.

**Non traité automatiquement** (décision humaine) :
- Fusion colonnes `description` / `short_desc` / `long_description` (risque données existantes).
- Suppression table `reviews` au profit de `product_reviews` (vérifier usage en prod).
- Renommage `stock` vs `stock_quantity` sur variants.

---

## Phase 4 — Pré-production

| Point | Statut |
|-------|--------|
| `next build` sans erreur TS | ✅ |
| `.env.example` documenté | ✅ (RESEND commenté) |
| Clés service_role / Stripe côté client | ✅ (routes API serveur) |
| Mentions légales / TVA / emails transactionnels | ⚠️ contenu légal à compléter manuellement |
| `RESEND_API_KEY` | ⚠️ non branché (emails commande / stock) |

---

## Fichiers modifiés ou créés (cette session)

- `middleware.ts`
- `lib/supabase.ts`
- `lib/supabase/middleware.ts`
- `app/auth/forgot-password/page.tsx` (nouveau)
- `app/auth/login/page.tsx`
- `app/admin/(dashboard)/layout.tsx`
- `app/api/newsletter/route.ts` (nouveau)
- `components/layout/Footer.tsx`
- `components/layout/SearchModal.tsx`
- `supabase/migrations/20260517120000_consolidation_preproduction.sql` (nouveau)
- `.env.example`
- `AUDIT_REPORT.md` (ce fichier)

---

## Mise à jour 2026-05-15 — audit production & carte complète

### Cartographie routes (état actuel)

**Storefront :** `/`, `/parfums`, `/produits/[slug]`, `/la-maison`, `/faq`, `/panier`, `/checkout`, `/confirmation/[orderId]`, `/suivi`, `/mentions-legales`, `/cgv`, `/confidentialite`.

**Auth :** `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/callback` (route), `/auth/auth-code-error`.

**Espace client :** `/mon-compte`, `/mon-compte/commandes`, **`/mon-compte/adresses`**, **`/mon-compte/favoris`**, **`/mon-compte/parametres`** (pages UX honnêtes, contenu « à venir » documenté).

**Admin :** `/admin/login`, `/admin`, `/admin/produits`, `/admin/collections`, `/admin/commandes`, `/admin/reviews`, `/admin/faq`, `/admin/translations`, `/admin/clients`, `/admin/design`, `/admin/marketing`, `/admin/notifications`, `/admin/compte`, `/admin/settings`, `/admin/perfumers`.

**API :** `GET/POST` selon fichiers dans `app/api/` (`catalog`, `collections`, `checkout/create-order`, `checkout/stripe-session`, `webhooks/stripe`, `invoices/[orderId]`, `orders/track`, `cart/abandon`, `newsletter`, `report-site-issue`).

### Bugs corrigés (cette passe)

| Gravité | Problème | Correction |
|--------|-----------|------------|
| 🔴 | `useEffect` après `return` dans `app/admin/(dashboard)/layout.tsx` (règle des hooks) | Effet `pathname` déplacé avant les retours conditionnels |
| 🔴 | Liens `href="#"` espace client (adresses, favoris, paramètres) | Routes dédiées + texte transparent |
| 🔴 | Liens réseaux `href="#"` dans le footer | URLs optionnelles via `NEXT_PUBLIC_SOCIAL_*` ; icônes masquées si non configurées |
| 🔴 | Mot de passe admin par défaut côté serveur + raccourcis login hardcodés | Bootstrap sans mot de passe par défaut ; raccourcis dev uniquement via variables d’environnement |
| 🟡 | Dashboard admin : pourcentages « +12.5% » fictifs | Badges de variation retirés tant qu’il n’y a pas de calcul réel |

### Fichiers touchés (révision 2026-05-15)

- `app/admin/(dashboard)/layout.tsx`, `app/admin/(dashboard)/page.tsx`
- `app/admin/login/actions.ts`, `app/admin/login/page.tsx`
- `app/mon-compte/page.tsx`
- `app/mon-compte/adresses/page.tsx`, `favoris/page.tsx`, `parametres/page.tsx` (nouveaux)
- `components/account/AccountStubPage.tsx` (nouveau)
- `components/layout/Footer.tsx`
- `.env.example`

### Score qualité (estimation)

| Axe | Note /100 | Commentaire |
|-----|-----------|-------------|
| Complétude routes | 88 | stubs compte documentés ; wishlist / adresses à implémenter |
| Cohérence UX | 82 | parcours principal OK ; contact form dédié absent (FAQ + report) |
| Sécurité | 78 | durcies bootstrap ; emails admin encore en dur côté middleware (voir SECURITY_REPORT) |
| SEO | 75 | metadata racine OK ; pages produit dynamiques non auditées individuellement |

### Recommandations restantes

Voir **TODO_FINAL.md** et rapports **RESPONSIVE_REPORT**, **SECURITY_REPORT**, **PERFORMANCE_REPORT**, **SUPABASE_REPORT**.

---

## Décisions humaines recommandées

1. **Appliquer la migration** consolidation sur Supabase production.
2. **Configurer** `NEXT_PUBLIC_APP_URL=https://www.atelierbianco.be` sur l’hébergeur.
3. **Stripe webhook** : URL prod → `/api/webhooks/stripe` + secret dans `.env`.
4. **Emails** : brancher Resend (confirmation commande, reset password, alerte stock).
5. **Aligner URLs admin** dans la doc interne : `/admin` (pas `/admin/dashboard`), `/admin/reviews` (pas `/avis`).
6. **Optionnel** : routes dédiées `/admin/produits/[id]` pour URLs partageables en équipe.

---

## Commandes de vérification

```bash
npm run build
npm run dev
# Puis tester : /parfums, /auth/forgot-password, /admin (redirect login), newsletter footer
```
