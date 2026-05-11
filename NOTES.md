# Notes — lancer Atelier Bianco

## Prérequis

- **Node.js** 20 ou supérieur (LTS recommandé).
- Un compte **Supabase** (projet créé).
- Compte **Stripe** si vous activez les paiements.

## Configuration des variables

1. Modèle versionné : **`.env.example`** (aucun secret).
2. Copiez-le en **`.env.local`** : `cp .env.example .env.local` (Windows : `copy .env.example .env.local`).
3. **Évitez** un fichier **`.env`** contenant des secrets à la racine : Next.js charge `.env`, `.env.local`, etc. ; plusieurs fichiers peuvent se marcher dessus. Tout le local doit vivre dans **`.env.local`**.
4. Renseignez au minimum pour un site « lecture catalogue » :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` **ou** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Pour **créer une commande** et **Stripe Checkout** côté serveur, ajoutez aussi :
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (webhook pointant vers votre URL déployée ou Stripe CLI en local).
6. En **local**, `APP_URL` / `NEXT_PUBLIC_APP_URL` = `http://localhost:3000`. En **production** (Render, Vercel, etc.), redéfinissez-les sur l’URL publique du site.

## Commandes

Depuis la racine du dépôt (dossier qui contient `package.json`) :

```bash
npm install
npm run dev
```

C’est la commande officielle : **`npm run dev`** lance Next.js en mode développement.

Ouvrir [http://localhost:3000](http://localhost:3000) (ou le port affiché dans le terminal si 3000 est déjà utilisé, ex. 3001).

### Windows PowerShell : « Impossible de charger npm.ps1 » / PSSecurityException

PowerShell peut bloquer **`npm.ps1`** (politique d’exécution). **Sans changer la politique globale**, utilisez la variante **`.cmd`** :

```powershell
cd C:\Users\User\Downloads\atelier-bianco
npm.cmd install
npm.cmd run dev
```

Ou une seule ligne :

```powershell
npm.cmd install; npm.cmd run dev
```

**Alternative** : double-clic sur **`install.cmd`** puis **`dev.cmd`** à la racine du projet (invocation directe de `npm.cmd`).

**Option durable** (compte utilisateur uniquement, scripts locaux autorisés) :

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Fermez puis rouvrez le terminal ; après cela, `npm install` classique fonctionne en général.

### Windows : « npm n’est pas reconnu »

Node.js doit être installé **avec** l’ajout au **PATH** (option proposée par l’installateur sur [nodejs.org](https://nodejs.org)). Ensuite **fermer et rouvrir** le terminal (ou Cursor).

Si le problème persiste, lancez explicitement le `npm` de l’installation standard :

```powershell
cd chemin\vers\atelier-bianco
& "$env:ProgramFiles\nodejs\npm.cmd" install
& "$env:ProgramFiles\nodejs\npm.cmd" run dev
```

Vous pouvez aussi double-cliquer sur **`dev.cmd`** à la racine du projet : il exécute **`npm run dev`** en utilisant `npm.cmd` depuis l’installation Node par défaut si besoin.

Autres scripts : `npm run build`, `npm run start`, `npm run lint`.

## Base de données Supabase

- Les schémas et seeds sont dans **`supabase/migrations/`**. Appliquez-les sur votre projet (SQL Editor Supabase ou CLI `supabase db push` après `supabase link`).
- Sans migrations, certaines colonnes ou politiques RLS peuvent manquer : le code prévoit des repli côté API catalogue quand c’est possible.

## Déploiement (ex. Vercel)

- Créez les **mêmes** variables que dans `.env.local` dans **Project → Settings → Environment Variables**.
- Ne mettez pas la **service role** dans une variable `NEXT_PUBLIC_*`.

## Sécurité (rappel)

- **Service role Supabase** = accès total à la base : réservé au serveur.
- **Clés Stripe secrètes** : serveur uniquement.
- Ne **commitez** jamais `.env.local` ni un `.env` rempli. Si un fichier de secrets a été poussé sur Git, **révoquez / régénérez** les clés concernées puis `git rm --cached` si besoin.
