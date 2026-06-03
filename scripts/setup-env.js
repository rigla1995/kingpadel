#!/usr/bin/env node
// Copies root .env to all app directories that need it
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function copyIfNotExists(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    return;
  }
  if (fs.existsSync(dest)) {
    console.log(`Already exists, skipping: ${dest}`);
  } else {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${dest}`);
  }
}

const rootEnv = path.join(root, '.env');
const rootEnvExample = path.join(root, '.env.example');

// Create root .env from example if missing
if (!fs.existsSync(rootEnv) && fs.existsSync(rootEnvExample)) {
  fs.copyFileSync(rootEnvExample, rootEnv);
  console.log('Created root .env from .env.example');
}

// Copy root .env to apps that need it
copyIfNotExists(rootEnv, path.join(root, 'apps/api/.env'));

// Copy web app env files
copyIfNotExists(
  path.join(root, 'apps/web-enseigne/.env.local.example'),
  path.join(root, 'apps/web-enseigne/.env.local')
);
copyIfNotExists(
  path.join(root, 'apps/web-admin/.env.local.example'),
  path.join(root, 'apps/web-admin/.env.local')
);
copyIfNotExists(
  path.join(root, 'apps/mobile/.env.example'),
  path.join(root, 'apps/mobile/.env')
);

console.log('\nSetup complete. You can now run:');
console.log('  docker compose up -d');
console.log('  pnpm --filter @kingpadel/api run prisma:migrate');
console.log('  pnpm --filter @kingpadel/api run prisma:seed');
console.log('  pnpm run dev:web');
