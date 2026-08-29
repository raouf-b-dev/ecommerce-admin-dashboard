import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const adminRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const apiRoot = path.resolve(adminRoot, '../ecommerce-store-api');

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_SKIP_DB_SEED === '1') {
    return;
  }

  execSync('npm run db:seed:auth', {
    cwd: apiRoot,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });
}
