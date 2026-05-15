# Audit — internationalisation (client FR / IT)

## Méthodologie

1. **Source de vérité** : paires `locales/fr.json` + `locales/it.json`, générées par `scripts/write-client-locales.cjs`.
2. **Runtime** : `LanguageProvider` fusionne ces fichiers + **surcharges** (`lib/brand-copy`) + table optionnelle `translations` Supabase (les surcharges brand restent prioritaires).
3. **Cookie** `app-language` : synchronisé avec `localStorage` pour les métadonnées serveur et `<html lang>`.

## Problèmes corrigés / réduits

- Chaînes FR hardcodées remplacées par `t('clé', 'fallback FR')` sur les flux listés dans `ITALIAN_TRANSLATION_REPORT.md`.
- Emails Resend bilingues (sujets + corps) via les clés `email.*`.
- Erreurs métier checkout (`server_misconfigured`, `total_mismatch`, etc.) localisées côté API `create-order` selon `locale` dans le body.
- `shipping_address.locale` enregistré pour que le webhook Stripe envoie l’email dans la langue du client.

## Limites résiduelles (à tracer)

- Contenu **CMS / Supabase** (produits, FAQ dynamique, bannières d’annonce Header) : dépend des champs `*_it` ou du contenu saisi.
- **Métadonnées spécifiques** à chaque page : seul le layout racine est dynamique via cookie ; les `metadata` exportés sur certaines routes peuvent rester en FR jusqu’à refonte.
- **Messages d’erreur bruts** (Supabase Auth, Stripe, Postgres) affichés tels quels si non mappés.

## QA

- `npm run build` : succès.
