import test from 'node:test';
import assert from 'node:assert/strict';

import { buildNormalizationPlan } from '../scripts/lib/normalization.mjs';
import { loadTaxonomy } from '../scripts/lib/paths.mjs';

const taxonomy = await loadTaxonomy();

const body = `### 📍 地點

高雄市前鎮區某路口

### 🏙️ 縣市

高雄市

### 🏷️ 問題類型

無障礙設施不足`;

test('新增狀態標籤時會移除其他狀態並保留表單分類', () => {
  const plan = buildNormalizationPlan({
    action: 'labeled',
    label: { name: '狀態/處理中' },
    issue: {
      number: 12,
      body,
      labels: [
        { name: '狀態/待確認' },
        { name: '狀態/處理中' },
        { name: '縣市/台北市' },
        { name: '類型/人行道' }
      ]
    }
  }, taxonomy);

  assert.deepEqual(plan.desired, ['縣市/高雄市', '類型/無障礙', '狀態/處理中']);
  assert.deepEqual(plan.remove.sort(), ['狀態/待確認', '縣市/台北市', '類型/人行道'].sort());
  assert.deepEqual(plan.add.sort(), ['縣市/高雄市', '類型/無障礙'].sort());
});

test('不在 taxonomy 中的受管理標籤會被移除', () => {
  const plan = buildNormalizationPlan({
    action: 'edited',
    issue: {
      number: 13,
      body,
      labels: [
        { name: '狀態/待確認' },
        { name: '縣市/不存在' },
        { name: '類型/不存在' }
      ]
    }
  }, taxonomy);

  assert(plan.remove.includes('縣市/不存在'));
  assert(plan.remove.includes('類型/不存在'));
});
