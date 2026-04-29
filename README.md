# Atelier Bianco

Maison de parfumerie de niche — **vitrine e-commerce** bilingue (FR / IT), catalogue, fiches produit, panier, checkout **Stripe**, commandes, espace **admin** (produits, collections, marketing, commandes), contenu éditable (Supabase).

## Stack technique

| Domaine | Choix |
|--------|--------|
| Framework | **Next.js 15** (App Router, React 19) |
| UI | **Tailwind CSS** v4, composants maison, **Motion** |
| Données & auth | **Supabase** (Postgres, Row Level Security, Auth, Storage) |
| Paiement | **Stripe** (Checkout hébergé, webhooks) |
| Emails | **Resend** |
| i18n | Contexte + table `translations` / contenus FR·IT en base |

## Démarrage rapide

1. **Variables d’environnement**  
   - Référence unique versionnée : fichier **`env`** à la racine.  
   - Copie locale : **`cp env .env.local`** (ou `copy env .env.local` sous Windows).  
   - Détail des étapes et prérequis : **`NOTES.md`**.

2. **Installation et serveur de dev**

   ```bash
   npm install
   npm run dev
   ```

   La commande à utiliser au quotidien est **`npm run dev`**. Sous **PowerShell**, si `npm.ps1` est bloqué, utilisez **`npm.cmd run dev`** (voir **`NOTES.md`**) ou les fichiers **`install.cmd`** / **`dev.cmd`** à la racine.

3. Ouvrir **http://localhost:3000** (Next peut choisir un autre port si 3000 est occupé).

## Scripts npm

- `npm run dev` — développement  
- `npm run build` — build production  
- `npm run start` — serveur après build  
- `npm run lint` — ESLint  

## Structure utile du dépôt

- `app/` — pages App Router, API routes (`app/api/...`), layouts  
- `components/` — UI réutilisable (layout, produit, home, admin…)  
- `lib/` — clients Supabase, compatibilité catalogue, utilitaires  
- `supabase/migrations/` — schéma SQL et données de référence (à appliquer sur votre projet Supabase)  
- `env` — **modèle** de toutes les variables (ne contient pas de secrets)  
- `NOTES.md` — checklist lancement, déploiement, sécurité  

## Fonctionnalités métier (aperçu)

- **Accueil** : hero configurable, sélection produits, blocs collections, FAQ.  
- **Catalogue** (`/parfums`) : onglets par collection, filtres, chargement via API serveur pour fiabilité.  
- **Fiche produit** : galerie, variantes, profil olfactif, avis.  
- **Checkout** : création de commande côté serveur (service role), session Stripe, confirmation.  
- **Admin** : produits (multilingue, collections, visuels olfactifs), collections, marketing, commandes.  

## Licence & contribution

Projet privé **Atelier Bianco** ; adaptez les contenus et clés à votre déploiement. Pour toute évolution du schéma Supabase, privilégiez une **nouvelle migration** dans `supabase/migrations/` plutôt que des changements manuels non tracés.
