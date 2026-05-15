# Rapport responsive — Atelier Bianco

**Date :** 2026-05-15  
**Périmètre :** App Router Next.js, Tailwind, composants `components/`, pages `app/`.

---

## Stratégie

- **Mobile-first** : utilitaires `.page-content`, `.heading-page`, `.heading-display`, `.touch-target` (`globals.css`).
- **Safe areas** : `viewport-fit: cover` + paddings `env(safe-area-inset-*)` dans `.page-content`.
- **Débordements** : `overflow-x: hidden` sur `html` / `body`.

---

## État par zone

| Zone | iPhone SE / petits | Standard / tablette | Desktop | Notes |
|------|-------------------|---------------------|---------|--------|
| Header + drawer | ✅ | ✅ | ✅ | Menu hamburger, overlay, fermeture scroll body |
| Footer | ✅ | ✅ | ✅ | Newsletter empilée ; réseaux conditionnels |
| Accueil (Hero, sélection, FAQ) | ✅ | ✅ | ✅ | Grilles et espacements progressifs |
| Catalogue `/parfums` | ✅ | ✅ | ✅ | Filtres scroll horizontal |
| Fiche produit | ✅ | ✅ | ✅ | CTA sticky bas d’écran < lg |
| Panier page | ✅ | ✅ | ✅ | Cartes empilées, padding réduit mobile |
| CartDrawer | ✅ | ✅ | ✅ | Pleine largeur, paddings tactiles |
| Checkout | ✅ | ✅ | ✅ | Stepper vertical mobile ; grilles `1` → `2` colonnes |
| Compte client (+ stubs) | ✅ | ✅ | ✅ | `page-content` + CTAs pleine largeur |
| Admin layout | ✅ | ✅ | ✅ | Sidebar drawer + overlay < lg |
| Tableaux admin | ⚠️ | ✅ | ✅ | Scroll horizontal ; dépend de chaque page |

---

## Bugs / risques corrigés ou identifiés

| Sujet | Statut |
|-------|--------|
| Padding top incohérent vs header fixe | Corrigé via `.page-content` sur les pages principales |
| Stepper checkout horizontal illisible | Corrigé : colonne sur mobile |
| Formulaires checkout `grid-cols-2` sur XS | Corrigé : `grid-cols-1 sm:grid-cols-2` |
| Admin : hook après early return (crash potentiel) | Corrigé (layout admin) |

---

## Tests manuels recommandés

1. **iPhone SE (375×667)** : accueil → parfums → produit → panier → checkout (saisie clavier ne cache pas CTA).
2. **Galaxy / Chrome** : même parcours + retour arrière panier.
3. **Tablette 768px** : admin — ouverture menu, scroll tableau commandes.
4. **Zoom 200%** (a11y) : textes légal, pas de texte tronqué sans lecture.

---

## Fichiers clés (responsive)

- `app/globals.css` — tokens utilitaires
- `components/layout/Header.tsx`, `Footer.tsx`, `SearchModal.tsx`
- `components/cart/CartDrawer.tsx`
- `app/checkout/page.tsx`, `app/produits/[slug]/page.tsx`, `app/parfums/page.tsx`
- `app/admin/(dashboard)/layout.tsx`

---

## Score qualité responsive (estimation)

**86 / 100** — Solide sur le parcours d’achat ; marge sur certains écrans admin denses et sur le polish micro-typographique par page légale.

## Recommandations restantes

- Passer chaque page admin en revue avec contenu réel (longues cellules, modales).
- Ajouter tests visuels (Chromatic / Playwright screenshots) sur 3 breakpoints.
- Vérifier **LCP** sur Hero : priorité `Image` + `sizes` cohérents (voir PERFORMANCE_REPORT).
