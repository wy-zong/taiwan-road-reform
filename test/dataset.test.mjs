import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDataset } from '../scripts/lib/dataset.mjs';
import { loadTaxonomy } from '../scripts/lib/paths.mjs';

const taxonomy = await loadTaxonomy();

const issueBody = `### 📍 地點

台中市西區公益路口

### 🏙️ 縣市

台中市

### 🏷️ 問題類型

號誌問題`;

test('buildDataset 排除 PR、套用標籤並計算統計', () => {
  const result = buildDataset([
    {
      number: 8,
      title: '號誌秒數過短',
      body: issueBody,
      html_url: 'https://example.com/issues/8',
      labels: [{ name: '狀態/已確認' }, { name: '縣市/台中市' }, { name: '類型/號誌' }],
      state: 'open',
      created_at: '2026-01-02T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
      closed_at: null
    },
    {
      number: 9,
      title: 'PR',
      labels: [],
      pull_request: { url: 'https://example.com/pulls/9' }
    }
  ], taxonomy, {
    repository: 'wy-zong/taiwan-road-reform',
    generatedAt: '2026-01-03T00:00:00Z'
  });

  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0].status, '已確認');
  assert.equal(result.issues[0].type, '號誌');
  assert.deepEqual(result.stats.byCity, { 台中市: 1 });
});
