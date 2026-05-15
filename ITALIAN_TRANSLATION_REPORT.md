# Rapport — internationalisation italienne (client)

## Objectif

Expérience **bilingue FR/IT** côté vitrine, boutique, tunnel d’achat, compte et emails transactionnels, **sans** modifier l’admin.

## Livrables techniques

| Élément | Détail |
|--------|--------|
| Fichiers de langue | `locales/fr.json`, `locales/it.json` (~378 clés chacune) |
| Générateur | `scripts/write-client-locales.cjs` (`node scripts/write-client-locales.cjs`) |
| API `t()` | `useLanguage().t` dans les composants client ; fallbacks FR obligatoires |
| Cookie + metadata | `app-language` ; `app/layout.tsx` `generateMetadata` + `lang` sur `<html>` |
| Emails | `lib/email.ts` lit les chaînes IT/FR depuis les JSON |

## Ton & qualité IT

Formulations orientées **profumeria di nicchia** : sobres, fluides, cohérentes avec un e-commerce luxe (éviter l’italien littéral « touriste » sur les CTA).

## Composants / pages mis à jour (sélection)

- Layout : Header (ARIA, menu mobile), Footer (copyright), CookieConsent, SearchModal, CartDrawer.
- Pages : panier, checkout (formulaire + toasts + CGV case à cocher), confirmation, suivi, mentions / CGV / confidentialité, mon-compte & commandes, auth (login, register, forgot), home (bannière promo), fiche produit (badges, avis, toasts).

## Responsive

Textes IT souvent plus longs : boutons et libellés passent par les mêmes classes qu’en FR (pas de duplication de composants). Vérification manuelle recommandée sur les steppers checkout et le menu mobile.

## QA effectuée

- `npm run build` : **OK** (TypeScript + build Next.js 16).

## Pistes suivantes

- Localiser explicitement la session Stripe (`locale`) si souhaité.
- Titres/description par URL pour le SEO fin (`generateMetadata` sur chaque `page.tsx`).
- Vérifier les réponses d’API non couvertes (ex. messages Postgres bruts) et les mapper à des codes + `t()`.
