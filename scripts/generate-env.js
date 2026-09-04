#!/usr/bin/env node
// Copies .env.example → .env.local and .secrets.example → .secrets.
// Passwords are not filled in: copy them from the API seeding guide into .secrets.
//
// Usage:
//   node scripts/generate-env.js
//   node scripts/generate-env.js --overwrite
//   node scripts/generate-env.js --secrets-only
//   node scripts/generate-env.js --secrets-only --overwrite
//   npm run env:init -- --overwrite
//   npm run env:init:secrets -- --overwrite

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2).reduce((acc, a) => {
  const [k, v] = a.startsWith('--') ? a.slice(2).split('=') : [a, true];
  acc[k] = v === undefined ? true : v;
  return acc;
}, {});

const FORCE = Boolean(args.overwrite || args.force);
const SECRETS_ONLY = Boolean(args.secretsOnly || args['secrets-only']);
const ENV_TEMPLATE = path.resolve(process.cwd(), '.env.example');
const ENV_TARGET = path.resolve(process.cwd(), '.env.local');
const SECRETS_TEMPLATE = path.resolve(process.cwd(), '.secrets.example');
const SECRETS_TARGET = path.resolve(process.cwd(), '.secrets');

async function copyTemplate(templatePath, targetPath, missingLabel) {
  const template = await fsp.readFile(templatePath, 'utf8').catch(() => '');
  if (!template) {
    console.error(`⚠️  Template not found or empty: ${missingLabel}`);
    process.exitCode = 1;
    return false;
  }

  const existed = fs.existsSync(targetPath);
  if (existed && !FORCE) {
    console.log(
      `⏭️  Skipping ${path.basename(targetPath)} (exists). Use --overwrite to overwrite.`,
    );
    return false;
  }

  await fsp.writeFile(targetPath, template, { encoding: 'utf8' });
  console.log(
    `${existed ? '♻️  Overwrote' : '✅ Created'} ${path.basename(targetPath)}`,
  );
  return true;
}

async function writeSecrets() {
  const wrote = await copyTemplate(
    SECRETS_TEMPLATE,
    SECRETS_TARGET,
    '.secrets.example',
  );
  if (!wrote) {
    return;
  }
  console.log(
    '   → Fill E2E_* passwords from the API seeding guide. Do not commit .secrets.',
  );
  console.log(
    '   → Copy filled values into GitHub Secrets for the Playwright CI job.',
  );
}

async function writeEnvLocal() {
  await copyTemplate(ENV_TEMPLATE, ENV_TARGET, '.env.example');
}

async function main() {
  if (SECRETS_ONLY) {
    await writeSecrets();
    return;
  }

  await writeEnvLocal();
  await writeSecrets();
}

void main();
