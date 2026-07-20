import test from 'node:test';
import assert from 'node:assert/strict';

import { extractIssueFields, parseCoordinates, parseIssueForm } from '../scripts/lib/issue-form.mjs';
import { loadTaxonomy } from '../scripts/lib/paths.mjs';

const taxonomy = await loadTaxonomy();

const body = `### 📍 地點

台北市大安區復興南路一段 23 號前

### 🗺️ 地圖位置連結（選填）

https://www.google.com/maps/@25.0330,121.5454,18z

### 🏙️ 縣市

台北市

### 🏷️ 問題類型

人行道缺失/破損
`;

test('parseIssueForm 依 Issue Form 標題切分欄位', () => {
  const fields = parseIssueForm(body);
  assert.equal(fields['📍 地點'], '台北市大安區復興南路一段 23 號前');
  assert.equal(fields['🏙️ 縣市'], '台北市');
});

test('extractIssueFields 解析分類與精確座標', () => {
  const result = extractIssueFields(body, taxonomy);
  assert.equal(result.city, '台北市');
  assert.equal(result.type, '人行道');
  assert.deepEqual(result.coordinates, [25.033, 121.5454]);
});

test('parseCoordinates 支援 OpenStreetMap 分享網址並拒絕台灣外座標', () => {
  assert.deepEqual(
    parseCoordinates('https://www.openstreetmap.org/#map=18/24.1477/120.6736'),
    [24.1477, 120.6736]
  );
  assert.equal(parseCoordinates('https://example.com/@35.6812,139.7671,18z'), null);
});
