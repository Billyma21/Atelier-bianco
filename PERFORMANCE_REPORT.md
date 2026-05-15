# Rapport performance — Atelier Bianco

**Date :** 2026-05-15  
**Objectif annoncé :** Lighthouse mobile 90+ (cible à valider par mesure réelle).

---

## Ce qui est favorable

- **Next.js 16** + build webpack optimisé production.
- **Fonts Google** en `display: 'swap'` (layout racine).
- **`next/image`** utilisé sur beaucoup de composants storefront.
- **Dynamic import** possible sur blocs lourds admin (Recharts) — à envisager si LCP/FID souffrent.

---

## Alertes ESLint / code (non bloquantes)

| Fichier | Avertissement |
|---------|----------------|
| `admin/collections/page.tsx` | `<img>` natif — préférer `Image` ou loader distant |
| `admin/perfumers/page.tsx` | Idem |
| `admin/commandes`, `perfumers` | `react-hooks/exhaustive-deps` — risque stale data, pas perf |

---

## Pistes d’optimisation

1. **Images** : uniformiser `sizes` sur galerie produit et hero ; éviter `unoptimized` sauf nécessité.
2. **Bundle admin** : `dynamic(() => import('recharts'), { ssr: false })` sur le dashboard.
3. **Catalogue** : cache HTTP / `revalidate` sur `GET /api/catalog` si compatible fraîcheur stock.
4. **Motion** : limiter animations sur mobile (réduire `layout` / `initial` coûteux) si profiling le demande.
5. **Third-party** : Stripe chargé au moment du checkout uniquement (déjà via redirect).

---

## Mesures à exécuter (obligatoire pré-prod)

```bash
npx lighthouse https://votre-domaine.com --preset=desktop --output html
npx lighthouse https://votre-domaine.com --preset=perf --form-factor=mobile
```

Ou intégration CI : `@lhci/cli`.

---

## Score performance (estimation sans Lighthouse)

**74 / 100** — Architecture correcte ; gains principaux attendus sur **images admin**, **code-splitting dashboard**, et **LCP hero**.

## Recommandations restantes

- Mesurer LCP sur `/` et `/produits/[slug]` en 4G throttling.
- Vérifier CLS après chargement fonts + cookie banner.
- Activer **ISR** ou tagging cache sur pages marketing si contenu semi-statique.
