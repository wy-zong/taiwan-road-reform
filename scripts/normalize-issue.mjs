import { readFile } from 'node:fs/promises';

import { createGitHubClient, encodeLabel } from './lib/github-api.mjs';
import { buildNormalizationPlan } from './lib/normalization.mjs';
import { loadTaxonomy } from './lib/paths.mjs';

async function ensureLabel(client, definition) {
  const path = `/repos/${client.repository}/labels/${encodeLabel(definition.name)}`;
  const existing = await client.request(path, { allow404: true });
  if (existing) return;

  await client.request(`/repos/${client.repository}/labels`, {
    method: 'POST',
    body: definition
  });
}

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) throw new Error('缺少 GITHUB_EVENT_PATH');

  const payload = JSON.parse(await readFile(eventPath, 'utf8'));
  if (!payload.issue) {
    console.log('目前事件不是 Issue 事件，略過標籤正規化');
    return;
  }

  const taxonomy = await loadTaxonomy();
  const client = createGitHubClient({
    token: process.env.GITHUB_TOKEN,
    repository: process.env.GITHUB_REPOSITORY
  });
  const plan = buildNormalizationPlan(payload, taxonomy);

  for (const definition of plan.definitions) await ensureLabel(client, definition);
  if (plan.add.length > 0) {
    await client.request(`/repos/${client.repository}/issues/${plan.issueNumber}/labels`, {
      method: 'POST',
      body: { labels: plan.add }
    });
  }

  for (const label of plan.remove) {
    await client.request(
      `/repos/${client.repository}/issues/${plan.issueNumber}/labels/${encodeLabel(label)}`,
      { method: 'DELETE', allow404: true }
    );
  }

  console.log(`Issue #${plan.issueNumber} 標籤正規化完成`, {
    add: plan.add,
    remove: plan.remove
  });
}

await main();
