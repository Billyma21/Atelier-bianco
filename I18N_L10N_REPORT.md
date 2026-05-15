# Rapport i18n / l10n — Atelier Bianco (vitrine client)

## Contexte technique

- **Langues** : `fr` | `it`, pilotées par `LanguageProvider`, cookie `app-language`, `localStorage`, et métadonnées racine via `generateMetadata` dans `app/layout.tsx`.
- **Dictionnaires** : `locales/fr.json` et `locales/it.json` (423 clés chacune), fusionnés dans `lib/i18n/merge-locales.ts`.
- **Traductions dynamiques** : table Supabase `translations` + merge dans `LanguageContext` (sans recopier le FR dans l’IT — voir ci‑dessous).

Il n’y a **pas** de préfixe d’URL `/it/...` : l’URL `/produits/why` reste la même ; la langue active est celle choisie par l’utilisateur (cookie + contexte).

---

## 1. Correctifs critiques (anti-fuite FR → IT)

### `t()` (`context/LanguageContext.tsx`)

- **Avant** : si la clé manquait en italien, le texte de l’**autre** langue (souvent le français) était renvoyé.
- **Après** :
  - **Italien** : uniquement `tr.it` ; sinon `fallback` puis clé brute (à éviter en prod : compléter les JSON).
  - **Français** : `tr.fr`, puis repli **`tr.it`** si le FR est vide (évite les trous côté FR).
- **Jamais** : IT → FR.

### Merge Supabase `translations`

- **Avant** : `it = itRaw || prev.it || fr` injectait du français dans l’italien.
- **Après** : `it = itRaw || prev.it` uniquement.

### Contenu CMS (`home_content`, en-tête)

- **Accueil** (`app/page.tsx`) : bandeau promo, titre/sous-titre de storytelling, textes : en IT on privilégie `*_it` ; sinon **pas** d’affichage du champ FR seul — repli sur `t('home.*')`.
- **Hero** (`components/home/Hero.tsx`) : `hero_subtitle` / `hero_lead` / `story_text` français ne remplacent plus l’italien ; champs optionnels `*_it` documentés côté CMS (`hero_subtitle_it`, `hero_lead_it`, `story_text_it`, `hero_image_alt_it`, etc.).
- **En-tête** (`Header.tsx`) : support optionnel `announcement_text_it` dans `header_settings` (`ThemeContext`) ; si absent en IT → `t('home.promo_banner')`, pas le bandeau FR.

---

## 2. Données produit & olfaction

### Helper `localizedText` (`lib/i18n/localized-text.ts`)

Utilisé sur la **page produit** pour `name`, `family`, `description`, titres/descriptions de profil olfactif : en italien, **aucune** valeur française n’est choisie si l’italien existe ; `family` vide retombe sur `t('product.family_default')` (« Estratto di profumo »).

### Notes olfactives (Supabase)

- Migration **`20260520120000_olfactory_notes_name_it.sql`** :
  - colonne `olfactory_notes.name_it`
  - mapping FR → IT pour les noms issus des seeds (WHY, MASAMVNE, etc.)
  - normalisation `products.family_it` lorsque la valeur était encore « Extrait de Parfum ».

### Démos / fallbacks locaux

- `lib/home-showcase-fallback.ts` et `lib/product-demo-mocks.ts` : textes IT ajoutés (`description_it`, `short_desc_it`, `family_it`, profils, stories, `name_it` sur les notes).
- `lib/brand-copy.ts` : **`WHY_DESCRIPTION_IT`**, **`MASAMVNE_SHORT_DESC_IT`**, **`MASAMVNE_DESCRIPTION_IT`**.

---

## 3. UI corrigée (exemples utilisateur)

| Fuite signalée | Correctif |
|----------------|-----------|
| FAQ depuis la base sans `question_it` / `answer_it` | Repli `t('faq.locale_content_pending')` **en italien**, jamais sur le paragraphe français |
| « Survolez pour zoomer » | `ProductGallery` + clés `product.gallery_zoom_hint` |
| « Prix » | `product.price_label` |
| « VOTRE EMAIL » / placeholder | `form.email` |
| « Architecture olfactive » / pyramide / descriptions | Clés `olfactory.*` dans les deux JSON |
| Bandeau promo / livraison 150 € | `home.promo_banner` IT + logique CMS/header |
| Filtres catalogue (Prix, Intensité, Léger…) | Clés `catalog.filter_*`, `catalog.intensity_*`, `catalog.apply_filters` |
| Collection mise en avant | `FeaturedCollection` : `description_it`, `t('home.featured_eyebrow')`, liens produits |
| Onglets produit | IDs `profile` / `reviews` + `t('product.tab.*')` |

---

## 4. Clés ajoutées

Environ **39** nouvelles clés miroir FR/IT (olfactory, produit, formulaires, catalogue, hero, etc.). Les fichiers restent **strictement parités** (423 clés).

---

## 5. Ce qui reste une responsabilité « contenu »

1. **Contenu éditorial uniquement en base FR** (descriptions longues, FAQ `question_fr` sans `question_it`, textes `home_content` sans `*_it`) : le code évite le français **lorsque** des champs IT existent ou que des `t()` couvrent le besoin ; pour du texte 100 % maison en italien, il faut **remplir** les champs IT ou les entrées `translations` / admin.
2. **Avis clients** : le corps des commentaires reste dans la langue de saisie.
3. **`/it/produits/...`** : non implémenté (pas de sous-dossier `[locale]`). Pour hreflang SEO complet avec chemins distincts, il faudrait une évolution routing (hors périmètre de ce lot).

---

## 6. Prévention & stratégie durable

1. **Règle d’or** : ne jamais passer une chaîne FR comme `fallback` de `t()` pour un libellé visible en IT ; préférer une clé dans `it.json`.
2. **Schéma DB** : conserver / étendre les colonnes `*_it` (produits, collections, notes, paramètres site).
3. **Admin** : champs jumeaux FR/IT pour bandeau, home, collections.
4. **CI** : script de parité `fr.json` / `it.json` (déjà vérifiable avec un petit script Node).
5. **Option plus tard** : `next-intl` + segments `[locale]` si vous voulez URLs localisées et chargement de messages par locale — le présent travail reste compatible (dictionnaires déjà centralisés).

---

## 7. Vérification

- `npm run build` : **OK** (TypeScript + pages).
- Test manuel recommandé : cookie `app-language=it`, parcours Accueil → Profumi → Fiche WHY → Panier / Checkout, avec contenu CMS par défaut et après migration Supabase des notes.

---

*Généré automatiquement dans le cadre du chantier i18n client Atelier Bianco.*
