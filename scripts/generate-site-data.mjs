import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildDataset } from './lib/dataset.mjs';
import { createGitHubClient } from './lib/github-api.mjs';
import { loadTaxonomy, resolveProjectPath } from './lib/paths.mjs';

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  const taxonomy = await loadTaxonomy();
  const client = createGitHubClient({
    token: process.env.GITHUB_TOKEN,
    repository
  });
  const rawIssues = await client.fetchAllIssues();
  const dataset = buildDataset(rawIssues, taxonomy, { repository });
  const issuesOutput = resolveProjectPath(process.env.OUTPUT_PATH || 'website/data/issues.json');
  const taxonomyOutput = resolveProjectPath(
    process.env.TAXONOMY_OUTPUT_PATH || 'website/data/taxonomy.json'
  );

  await Promise.all([
    writeJson(issuesOutput, dataset),
    writeJson(taxonomyOutput, taxonomy)
  ]);

  console.log(`已產生 ${dataset.issues.length} 筆網站資料`);
}

await main();
