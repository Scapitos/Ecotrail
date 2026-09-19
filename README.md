# EcoTrail

EcoTrail est une application web qui propose des défis nature (biodiversité, écologie, apprentissage) adaptés au type de balade choisi par l'utilisateur. Les points gagnés et la progression sont sauvegardés par utilisateur via Supabase.

## Stack technique

- [React 19](https://react.dev/) + [Vite](https://vite.dev/) (build & dev server)
- [Supabase](https://supabase.com/) (authentification + base de données)
- [lucide-react](https://lucide.dev/) (icônes)
- [oxlint](https://oxc.rs/) (lint)

## Prérequis

- Node.js `^20.19.0` ou `>=22.12.0`
- npm (fourni avec Node.js)
- Un projet [Supabase](https://supabase.com/) (gratuit) pour l'authentification et le stockage des données utilisateur

## Installation

```bash
npm install
```

## Configuration

L'application a besoin d'un projet Supabase pour fonctionner (connexion/inscription, sauvegarde des points et de la balade en cours).

1. Crée un projet sur [supabase.com](https://supabase.com/).
2. Dans **Project Settings** (icône engrenage), récupère l'URL du projet et la clé d'API — depuis la refonte du système de clés par Supabase, ces informations sont réparties sur deux écrans distincts :
   - **Settings → Data API** : le **Project URL**
   - **Settings → API Keys** : la clé — soit la nouvelle clé `publishable` (`sb_publishable_...`, onglet **API Keys**), soit l'ancienne clé `anon` (onglet **Legacy API Keys**)
3. Copie `.env.local.example` en `.env.local` à la racine du projet et renseigne ces deux valeurs :

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   `.env.local` n'est jamais commité (voir `.gitignore`).

4. Dans l'éditeur SQL de Supabase, crée la table `profils` utilisée par l'application pour stocker les points et la balade en cours de chaque utilisateur :

   ```sql
   create table profils (
     id uuid primary key references auth.users (id) on delete cascade,
     points_total integer default 0,
     balade_en_cours jsonb
   );

   alter table profils enable row level security;

   create policy "Un utilisateur gère son propre profil"
     on profils for all
     using (auth.uid() = id)
     with check (auth.uid() = id);
   ```

## Lancer le projet en local

```bash
npm run dev
```

L'application est alors accessible sur [http://localhost:5173](http://localhost:5173).

## Scripts disponibles

| Commande          | Description                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Lance le serveur de développement avec hot reload |
| `npm run build`   | Génère le build de production dans `dist/`        |
| `npm run preview` | Sert le build de production en local              |
| `npm run lint`    | Vérifie le code avec oxlint                       |
