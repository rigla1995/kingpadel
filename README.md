# KingPadel

Application mobile + web pour la gestion du padel en Tunisie.

## Architecture

```
kingpadel/
├── apps/
│   ├── api/             → Backend NestJS + PostgreSQL (port 3001)
│   ├── mobile/          → App mobile React Native / Expo (iOS + Android)
│   ├── web-enseigne/    → Dashboard enseignes Next.js (port 3002)
│   └── web-admin/       → Back-office admin Next.js (port 3003)
├── packages/
│   ├── ui/              → Composants partagés
│   └── types/           → Types TypeScript partagés
└── docker-compose.yml   → PostgreSQL + Redis + MailDev
```

## Prérequis

### Windows (Git Bash / PowerShell)

1. **Node.js 20 LTS** — https://nodejs.org → bouton vert "LTS" → installer avec options par défaut
2. **pnpm** — ouvrir Git Bash après installation de Node.js :
   ```bash
   npm install -g pnpm
   ```
3. **Docker Desktop** — https://www.docker.com/products/docker-desktop → installer et **le lancer** avant de continuer
4. **Git** — déjà installé si vous utilisez Git Bash

> Après installation de Node.js, **fermer et rouvrir** Git Bash pour que les commandes soient reconnues.

### Vérification

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
pnpm --version    # 9.x.x
docker --version  # Docker version 2x.x
```

## Installation & Démarrage

### 1. Cloner le repo

```bash
git clone https://github.com/rigla1995/kingpadel.git
cd kingpadel
```

### 2. Variables d'environnement

```bash
cp .env.example .env
# Pour les apps web (optionnel pour commencer) :
cp apps/web-enseigne/.env.local.example apps/web-enseigne/.env.local
cp apps/web-admin/.env.local.example apps/web-admin/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Les valeurs par défaut fonctionnent pour le développement local.

### 3. Installer les dépendances

```bash
pnpm install
```

### 4. Démarrer la base de données

```bash
docker compose up -d
```

Attendre ~10 secondes, puis :

```bash
# Créer les tables
pnpm --filter @kingpadel/api prisma:migrate

# Peupler les données de test
pnpm --filter @kingpadel/api prisma:seed
```

### 5. Démarrer toutes les apps

```bash
pnpm dev
```

Ou séparément :

```bash
# Terminal 1 — API
pnpm --filter @kingpadel/api dev

# Terminal 2 — Web Enseigne
pnpm --filter @kingpadel/web-enseigne dev

# Terminal 3 — Web Admin
pnpm --filter @kingpadel/web-admin dev

# Terminal 4 — Mobile
pnpm --filter @kingpadel/mobile dev
```

## URLs locales

| App | URL |
|-----|-----|
| API Backend | http://localhost:3001 |
| Swagger (doc API) | http://localhost:3001/api/docs |
| Web Enseigne | http://localhost:3002 |
| Web Admin | http://localhost:3003 |
| App Mobile | QR code dans le terminal (scanner avec Expo Go) |
| MailDev (emails) | http://localhost:1080 |

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@kingpadel.tn | Admin1234! |
| Enseigne | enseigne@kingpadel.tn | Test1234! |
| Joueur | joueur@kingpadel.tn | Test1234! |

## Commandes utiles

```bash
# Réinitialiser la base de données
pnpm --filter @kingpadel/api prisma:migrate -- --force-reset

# Voir les données (interface graphique)
pnpm --filter @kingpadel/api prisma:studio

# Lancer les tests
pnpm test

# Build de production
pnpm build
```
