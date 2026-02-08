# OmniSoin Assist

Plateforme medicale IA pour la gestion de structures de soins.

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Base de donnees** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth (MFA)
- **UI** : Tailwind CSS + shadcn/ui
- **Tests E2E** : Playwright
- **Deploiement** : Vercel

## Fonctionnalites

- Multi-praticiens & delegations
- Gestion de patientele
- Transcription & assistant clinique IA
- Integration WhatsApp
- Architecture RGPD-ready
- Authentification securisee MFA

## Demarrage rapide

### Prerequis

- Node.js 20+
- npm

### Installation

```sh
git clone https://github.com/joelvalendoff55/omnisoin-nextjs.git
cd omnisoin-nextjs
npm install
```

### Variables d'environnement

Copiez `.env` et creez `.env.local` pour les surcharges locales :

```sh
cp .env .env.local
```

Variables requises :

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cle publique (anon) Supabase |
| `NEXT_PUBLIC_SUPABASE_PROJECT_ID` | ID du projet Supabase |

### Lancement

```sh
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Tests E2E

```sh
npx playwright install --with-deps
npx playwright test
```

## Deploiement

Le projet est deploye automatiquement sur Vercel a chaque push sur `main`.

**Production** : [omnisoin-nextjs.vercel.app](https://omnisoin-nextjs.vercel.app)

## Licence

Proprietary - All rights reserved.
