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
   - Modèle versionné unique : **`.env.example`**.  
   - Copie locale des secrets : **`cp .env.example .env.local`** (Windows : `copy .env.example .env.local`).  
   - Ne pas utiliser de fichier **`.env`** à la racine en parallèle de **`.env.local`** : Next.js les charge tous les deux et cela crée des conflits. Un seul fichier de travail : **`.env.local`**.  
   - Renseigner au minimum **`NEXT_PUBLIC_SUPABASE_URL`** et **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** ou **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**, plus **`SUPABASE_SERVICE_ROLE_KEY`** pour le catalogue serveur et le checkout.  
   - Détail : **`NOTES.md`**.

2. **Base Supabase (schéma + RLS)**  
   Si le tableau *Database* / l’Advisor indiquent des tables sans RLS ou « No migrations », appliquez les migrations du dépôt :

   ```bash
   npx supabase login
   npx supabase link --project-ref VOTRE_PROJECT_REF
   npx supabase db push
   ```

   Le *project ref* est la partie avant `.supabase.co` dans l’URL du projet (ex. `https://tqazhmuvmtgfsggdttzc.supabase.co` → ref `tqazhmuvmtgfsggdttzc`).

3. **Installation et serveur de dev**

   ```bash
   npm install
   npm run dev
   ```

   La commande à utiliser au quotidien est **`npm run dev`**. Sous **PowerShell**, si `npm.ps1` est bloqué, utilisez **`npm.cmd run dev`** (voir **`NOTES.md`**) ou les fichiers **`install.cmd`** / **`dev.cmd`** à la racine.

4. Ouvrir **http://localhost:3000** (Next peut choisir un autre port si 3000 est occupé).

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
- `.env.example` — **modèle** des variables (sans secrets) ; copie → `.env.local`  
- `NOTES.md` — checklist lancement, déploiement, sécurité  

## Fonctionnalités métier (aperçu)

- **Accueil** : hero configurable, sélection produits, blocs collections, FAQ.  
- **Catalogue** (`/parfums`) : onglets par collection, filtres, chargement via API serveur pour fiabilité.  
- **Fiche produit** : galerie, variantes, profil olfactif, avis.  
- **Checkout** : création de commande côté serveur (service role), session Stripe, confirmation.  
- **Admin** : produits (multilingue, collections, visuels olfactifs), collections, marketing, commandes.  

## Licence & contribution

Projet privé **Atelier Bianco** ; adaptez les contenus et clés à votre déploiement. Pour toute évolution du schéma Supabase, privilégiez une **nouvelle migration** dans `supabase/migrations/` plutôt que des changements manuels non tracés.
