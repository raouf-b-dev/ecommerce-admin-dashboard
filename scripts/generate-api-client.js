import fs from 'node:fs/promises';
import path from 'node:path';

for (const envFile of ['.env.local', '.env']) {
  const envPath = path.resolve(process.cwd(), envFile);
  try {
    process.loadEnvFile(envPath);
  } catch {
    // File not found or unreadable; continue.
  }
}

function resolveSpecUrl() {
  const rawUrl = process.env.API_OPENAPI_URL?.trim();
  if (rawUrl) {
    if (rawUrl.endsWith('-json') || rawUrl.endsWith('.json')) {
      return rawUrl;
    }
    return `${rawUrl.replace(/\/+$/, '')}-json`;
  }
  const apiBase = (
    process.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3000'
  ).replace(/\/+$/, '');
  return `${apiBase}/api/docs-json`;
}

const specUrl = resolveSpecUrl();
const outputFile = path.resolve(
  process.cwd(),
  'src/lib/api/generated/schema.d.ts',
);

async function generate() {
  try {
    const response = await fetch(specUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${specUrl}`);
    }

    const spec = await response.json();
    const { default: openapiTS, astToString } = await import('openapi-typescript');
    const ast = await openapiTS(spec);
    const output = astToString(ast);

    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, output, 'utf8');

    console.log(`OpenAPI types generated at ${outputFile}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error('Failed to generate OpenAPI client types.');
    console.error(`Source: ${specUrl}`);
    console.error(
      'Make sure ecommerce-store-api is running and Swagger is available, or set API_OPENAPI_URL explicitly.',
    );
    console.error(`Reason: ${message}`);
    process.exitCode = 1;
  }
}

void generate();
