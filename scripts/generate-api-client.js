import fs from 'node:fs/promises';
import path from 'node:path';

const specUrl = `${process.env.API_OPENAPI_URL ?? 'http://localhost:3000/api/docs'}-json`;
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
