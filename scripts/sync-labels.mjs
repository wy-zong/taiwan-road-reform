import { createGitHubClient, encodeLabel } from './lib/github-api.mjs';
import { getLabelDefinition } from './lib/normalization.mjs';
import { loadTaxonomy } from './lib/paths.mjs';

const taxonomy = await loadTaxonomy();
const client = createGitHubClient({
  token: process.env.GITHUB_TOKEN,
  repository: process.env.GITHUB_REPOSITORY
});
const existingLabels = new Map((await client.fetchAllLabels()).map((label) => [label.name, label]));
const managedNames = [
  ...taxonomy.statuses.map((item) => item.label),
  ...taxonomy.issueTypes.map((item) => item.label),
  ...taxonomy.cities.map((item) => `${taxonomy.labelPrefixes.city}${item.name}`)
];

for (const name of managedNames) {
  const definition = getLabelDefinition(name, taxonomy);
  const existing = existingLabels.get(name);
  if (!existing) {
    await client.request(`/repos/${client.repository}/labels`, {
      method: 'POST',
      body: definition
    });
    continue;
  }

  if (existing.color !== definition.color || existing.description !== definition.description) {
    await client.request(`/repos/${client.repository}/labels/${encodeLabel(name)}`, {
      method: 'PATCH',
      body: {
        new_name: name,
        color: definition.color,
        description: definition.description
      }
    });
  }
}

console.log(`已同步 ${managedNames.length} 個受管理標籤`);
