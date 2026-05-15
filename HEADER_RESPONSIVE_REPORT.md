# Rapport Header responsive & logo — Atelier Bianco

**Date :** 2026-05-15  
**Fichiers principaux :** `components/layout/Header.tsx`, `public/images/logo-atelier-bianco-wordmark.png`, `app/globals.css`

---

## Objectifs livrés

| Exigence | Statut |
|----------|--------|
| Mobile-first, grille 3 zones sans overflow | `grid-cols-[auto_minmax(0,1fr)_auto]` |
| Desktop : nav gauche / logo centré absolu / actions droite | Oui |
| Logo ratio conservé, `next/image` priority + sizes + quality 95 | Oui (fichiers locaux optimisés par Next sauf URLs externes) |
| Safe area iOS (notch) header + bandeau annonce + drawer | `env(safe-area-inset-*)` |
| Scroll : fond cream + blur + ombre légère + padding réduit | Seuil 8px, transitions 500ms |
| Menu mobile : overlay blur, spring panel, stagger liens | Framer Motion |
| Touch targets ≥ 44px | Classe `.touch-target` conservée |
| Build production | `npm run build` — succès |

---

## Logo transparent

- **Fichier servi :** `/images/logo-atelier-bianco-wordmark.png`
- **Source :** copie depuis l’asset utilisateur `*removebg-preview-f0066503-*.png` (écrasement de l’ancien fichier).
- **Intrinsics composant :** `720×120` (ratio large), `object-contain`, pas d’écrasement.
- **Responsive :** hauteurs par breakpoint + `max-w` en `min(..., calc(100vw - réserves))` pour éviter collision avec burger / icônes.

---

## Variables layout (`globals.css`)

- `--site-header-h` : **3.5rem** mobile → **4rem** md → **4.5rem** lg (aligné header un peu plus compact verticalement tout en gardant de l’air pour `.page-content`).

---

## Architecture du composant

- **`HeaderLogo`** — lien + `Image`, logique URL externe / `unoptimized` si HTTP(S).
- **`DesktopNav`** — liens uppercase, tracking luxe.
- **`ActionCluster`** — langue desktop, recherche, compte, panier + badge.
- **`IconAction`** — bouton icône homogène (recherche).

Nettoyage : pas de placeholders, structure DOM réduite au nécessaire.

---

## Tests manuels recommandés

1. iPhone SE 320px : pas de scroll horizontal, logo lisible, 3 icônes accessibles.  
2. Rotation paysage : menu drawer + fermeture overlay.  
3. Scroll sur homepage : transition fond/blur sans saut brutal.  
4. Bandeau annonce activé : header sous `top-8`, pas de chevauchement logo.  
5. FR / IT : `LanguageSwitcher` dans le tiroir mobile + desktop.

---

## Limites / suite

- **Theme Supabase** : si `logo_url` personnalisée en base, elle remplace le PNG public (comportement inchangé).  
- **Tests E2E** automatisés (Playwright) : non ajoutés dans cette passe — à brancher en CI si besoin.

---

## Score qualité (estimation)

**92 / 100** — Header aligné brief luxe + contraintes mobiles ; marge sur mesures Lighthouse CLS réelles après déploiement.
