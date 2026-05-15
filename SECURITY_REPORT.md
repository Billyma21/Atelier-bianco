# Rapport sécurité — Atelier Bianco

**Date :** 2026-05-15  
**Stack :** Next.js, Supabase (Auth + RLS), Stripe, Vercel.

---

## Contrôles effectués (analyse code + config)

| Sujet | Statut | Détail |
|-------|--------|--------|
| Secrets dans le client | ✅ | Pas de `STRIPE_SECRET` / `SERVICE_ROLE` en `NEXT_PUBLIC_*` |
| Checkout création commande | ✅ | Logique serveur ; validation montants à vérifier dans `create-order` |
| Webhooks Stripe | ⚠️ | Dépend config prod (secret, idempotence) — à valider en staging |
| Middleware admin | ✅ | Routes `/admin/*` hors `login` protégées |
| Middleware compte | ✅ | `/mon-compte/*` exige session Supabase si URL/key présents |
| Rate limiting | ⚠️ | Présent sur parties sensibles (`lib/rate-limit.ts`) — étendre si besoin |
| Headers HTTP | ✅ | `vercel.json` (hébergement Vercel) |
| Bootstrap admin | 🔧 **Corrigé** | Suppression du mot de passe par défaut côté serveur ; email + MDP obligatoires |
| Raccourcis login admin (KENZY / 1190) | 🔧 **Corrigé** | Désactivés en production ; dev uniquement avec `ADMIN_BOOTSTRAP_DEV_PASSWORD` + `NEXT_PUBLIC_ADMIN_DEV_SHORT_PASSWORD` |
| Liste d’emails admin autorisés | ⚠️ | `kenzy@ab.be`, `bilyma21@gmail.com` encore en dur dans `admin layout` — **à externaliser** (`NEXT_PUBLIC_ADMIN_EMAILS` ou table) |
| fichier `bootstrapAdmin` | ⚠️ | Toujours très sensible : à désactiver ou restreindre par IP / feature flag en prod |

---

## Risques résiduels (priorité)

1. **High** : `bootstrapAdmin` appelé à chaque tentative de login admin — surface d’abus si credentials admin devinent un email valide. Recommandation : désactiver en prod ou n’exposer qu’avec `ADMIN_BOOTSTRAP_ENABLED=true` + IP allowlist.
2. **Medium** : emails admin en dur — rotation / fuite de dépôt = exposition.
3. **Medium** : uploads storage — vérifier policies Supabase Storage (bucket `product-olfactory`, etc.) avant go-live.
4. **Low** : `console.error` sur erreurs auth — acceptable ; éviter logs avec PII en prod.

---

## Mesures déjà en place (rappel)

- Cookies session via `@supabase/ssr` / client aligné SSR.
- Validation et rate limit sur newsletter et création commande (selon implémentation actuelle).

---

## Fichiers revus / modifiés (sécurité, 2026-05-15)

- `app/admin/login/actions.ts` — pas de mot de passe par défaut ; logs dev only
- `app/admin/login/page.tsx` — raccourcis dev conditionnels
- `.env.example` — variables sociales + dev admin documentées

---

## Score sécurité (estimation)

**72 / 100** — Base saine ; durcissement admin (bootstrap + allowlist) et externalisation des emails critiques avant production à fort trafic.

## Actions suivantes

1. Externaliser les emails admin (env ou DB).
2. Feature-flag `bootstrapAdmin` hors dev.
3. Audit RLS complet côté Supabase (voir SUPABASE_REPORT).
4. Pentest léger sur `/api/checkout/*` (forgery montants, replay).
