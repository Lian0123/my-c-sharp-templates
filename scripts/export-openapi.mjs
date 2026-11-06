import fs from 'node:fs/promises';
const base = process.env.BASE_URL ?? 'http://localhost:8080';
await fs.mkdir('docs/openapi', { recursive: true });
for (const service of ['auth', 'account', 'message']) {
  const response = await fetch(`${base}/openapi/${service}/v1.json`);
  if (!response.ok) throw new Error(`OpenAPI ${service}: HTTP ${response.status}`);
  await fs.writeFile(`docs/openapi/${service}.json`, JSON.stringify(await response.json(), null, 2) + '\n');
}
