#!/usr/bin/env node
// Copies .env.example to .env.local for Vite.
// Also creates .secrets from .secrets.example with demo e2e values (API SEEDING.md).
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

/** Demo seed accounts — keep in sync with API docs/development/SEEDING.md */
const E2E_SECRET_DEFAULTS = {
  E2E_ADMIN_EMAIL: 'admin@store.local',
  E2E_ADMIN_PASSWORD: 'Admin123!',
  E2E_CUSTOMER_EMAIL: 'customer@store.local',
  E2E_CUSTOMER_PASSWORD: 'Customer123!',
  E2E_SUPERADMIN_EMAIL: 'superadmin@store.local',
  E2E_SUPERADMIN_PASSWORD: 'SuperAdmin123!',
};

function isKeyValueLine(line) {
  return /^[A-Za-z_][A-Za-z0-9_]*=/.test(line);
}

function keyOf(line) {
  return line.split('=')[0];
}

function buildLinesForSecrets(lines) {
  return lines.map((line) => {
    if (!isKeyValueLine(line)) return line;
    const key = keyOf(line);
    const value = E2E_SECRET_DEFAULTS[key];
    if (value !== undefined) return `${key}=${value}`;
    return line;
  });
}

async function writeSecrets() {
  const template = await fsp.readFile(SECRETS_TEMPLATE, 'utf8').catch(() => '');
  if (!template) {
    console.error('⚠️  Secrets template not found or empty: .secrets.example');
    process.exitCode = 1;
    return;
  }

  const existed = fs.existsSync(SECRETS_TARGET);
  if (existed && !FORCE) {
    console.log('⏭️  Skipping .secrets (exists). Use --overwrite to overwrite.');
    return;
  }

  const lines = buildLinesForSecrets(template.split(/\r?\n/));
  await fsp.writeFile(SECRETS_TARGET, lines.join('\n'), { encoding: 'utf8' });
  console.log(`${existed ? '♻️  Overwrote' : '✅ Created'} .secrets`);
  console.log('   → Copy E2E_* values into GitHub Secrets for the Playwright CI job.');
}

async function writeEnvLocal() {
  const template = await fsp.readFile(ENV_TEMPLATE, 'utf8').catch(() => '');
  if (!template) {
    console.error('⚠️  Env template not found or empty: .env.example');
    process.exitCode = 1;
    return;
  }

  const existed = fs.existsSync(ENV_TARGET);
  if (existed && !FORCE) {
    console.log('⏭️  Skipping .env.local (exists). Use --overwrite to overwrite.');
    return;
  }

  await fsp.writeFile(ENV_TARGET, template, { encoding: 'utf8' });
  console.log(`${existed ? '♻️  Overwrote' : '✅ Created'} .env.local`);
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
