import { access, readFile } from 'node:fs/promises';

import { loadTaxonomy, resolveProjectPath } from './lib/paths.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertUnique(values, name) {
  assert(new Set(values).size === values.length, `${name} 含有重複值`);
}

async function assertMissing(relativePath) {
  try {
    await access(resolveProjectPath(relativePath));
    throw new Error(`${relativePath} 是建置產物，不應提交至倉庫`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const taxonomy = await loadTaxonomy();
assert(taxonomy.schemaVersion === 1, 'taxonomy schemaVersion 必須為 1');
assertUnique(taxonomy.cities.map((item) => item.name), '縣市');
assertUnique(taxonomy.statuses.map((item) => item.value), '狀態');
assertUnique(taxonomy.statuses.map((item) => item.label), '狀態標籤');
assertUnique(taxonomy.issueTypes.map((item) => item.formValue), 'Issue 類型選項');
assertUnique(taxonomy.issueTypes.map((item) => item.label), '類型標籤');

const template = await readFile(
  resolveProjectPath('.github/ISSUE_TEMPLATE/road-issue.yml'),
  'utf8'
);
for (const city of taxonomy.cities) assert(template.includes(`- ${city.name}`), `Issue Form 缺少 ${city.name}`);
for (const type of taxonomy.issueTypes) {
  assert(template.includes(`- ${type.formValue}`), `Issue Form 缺少 ${type.formValue}`);
}

const fixture = JSON.parse(await readFile(resolveProjectPath('fixtures/issues.sample.json'), 'utf8'));
assert(fixture.schemaVersion === 1, '示範資料 schemaVersion 必須為 1');
assert(Array.isArray(fixture.issues), '示範資料 issues 必須是陣列');

const indexHtml = await readFile(resolveProjectPath('website/index.html'), 'utf8');
const requiredIds = [
  'main-layout',
  'stats-grid',
  'filter-city',
  'filter-status',
  'filter-type',
  'map',
  'map-legend',
  'issues-list'
];
for (const id of requiredIds) assert(indexHtml.includes(`id="${id}"`), `index.html 缺少 #${id}`);

const localAssets = [...indexHtml.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((asset) => !/^(?:https?:|#)/.test(asset));
for (const asset of localAssets) await access(resolveProjectPath(`website/${asset}`));

const publishWorkflow = await readFile(
  resolveProjectPath('.github/workflows/publish.yml'),
  'utf8'
);
assert(
  !/contents:\s*write/.test(publishWorkflow),
  'publish workflow 不得寫入 Git 內容；網站資料應只存在於 Pages artifact'
);

await Promise.all([
  assertMissing('data/issues.json'),
  assertMissing('website/data.json'),
  assertMissing('.github/workflows/auto-label.yml'),
  assertMissing('.github/workflows/deploy.yml'),
  assertMissing('.github/workflows/sync-data.yml')
]);

console.log('專案結構驗證完成');
