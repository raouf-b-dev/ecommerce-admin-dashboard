#!/usr/bin/env node
// Copies .env.example to .env.local for Vite.
//
// Usage:
//   node scripts/generate-env.js
//   node scripts/generate-env.js --overwrite
//   npm run env:init -- --overwrite

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2).reduce((acc, a) => {
  const [k, v] = a.startsWith('--') ? a.slice(2).split('=') : [a, true];
  acc[k] = v === undefined ? true : v;
  return acc;
}, {});

const FORCE = Boolean(args.overwrite || args.force);
const TEMPLATE = path.resolve(process.cwd(), '.env.example');
const TARGET = path.resolve(process.cwd(), '.env.local');

async function main() {
  const template = await fsp.readFile(TEMPLATE, 'utf8').catch(() => '');
  if (!template) {
    console.error('⚠️  Env template not found or empty: .env.example');
    process.exitCode = 1;
    return;
  }

  const existed = fs.existsSync(TARGET);
  if (existed && !FORCE) {
    console.log('⏭️  Skipping .env.local (exists). Use --overwrite to overwrite.');
    return;
  }

  await fsp.writeFile(TARGET, template, { encoding: 'utf8' });
  console.log(`${existed ? '♻️  Overwrote' : '✅ Created'} .env.local`);
}

void main();
