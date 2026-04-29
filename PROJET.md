# Atelier Bianco — fiche projet

### À propos de ce projet

**Atelier Bianco** est une application web de **maison de parfumerie de niche** : vitrine haute couture, **catalogue** et **e-commerce** (panier, commande, paiement). L’objectif est de présenter les créations (FR / IT), permettre l’achat en ligne via **Stripe**, et de piloter catalogue, collections, marketing et commandes depuis un **back-office** connecté à **Supabase** (base Postgres, authentification, stockage). Les emails transactionnels passent par **Resend**. Le contexte technique : **Next.js 15** (App Router), **Tailwind CSS** v4, données et RLS côté **Supabase**, déploiement type **Vercel** avec variables d’environnement documentées dans le fichier **`env`** (copie locale **`.env.local`**).

### Tâches à accomplir

- [ ] Dupliquer **`env`** vers **`.env.local`** et renseigner toutes les clés (Supabase, Stripe, Resend, URLs publiques).
- [ ] Appliquer les migrations SQL du dossier **`supabase/migrations/`** sur le projet Supabase (ordre chronologique des fichiers ou `supabase db push` après lien CLI).
- [ ] Vérifier les politiques **RLS** et les alertes **Supabase Advisor** après migration.
- [ ] Configurer le **webhook Stripe** (secret `STRIPE_WEBHOOK_SECRET`) pointant vers `/api/webhooks/stripe` en environnement de test puis production.
- [ ] Vérifier le domaine d’expéditeur **Resend** et la valeur de `RESEND_FROM_EMAIL`.
- [ ] Remplacer les images placeholder (Unsplash, etc.) par les assets définitifs (produits, collections, hero).
- [ ] Déployer (ex. Vercel), recopier les variables d’environnement et tester checkout + confirmation de commande.

### Documents

- [README.md](./README.md) — vue d’ensemble, stack, structure du dépôt, scripts npm.
- [NOTES.md](./NOTES.md) — prérequis, copie `env` → `.env.local`, déploiement, sécurité des clés.
- [env](./env) — modèle unique de variables d’environnement (sans secrets, versionné).
- [supabase/migrations/](./supabase/migrations/) — schéma et données de référence (dont catalogue, collections, produit « Le Jocker » si la migration dédiée est appliquée).
