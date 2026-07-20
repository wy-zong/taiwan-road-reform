import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeExternalUrl } from '../website/assets/js/dom.js';

test('normalizeExternalUrl 只接受 HTTP 與 HTTPS 連結', () => {
  assert.equal(normalizeExternalUrl('https://example.com/map?q=1'), 'https://example.com/map?q=1');
  assert.equal(normalizeExternalUrl('http://example.com/'), 'http://example.com/');
  assert.equal(normalizeExternalUrl('javascript:alert(1)'), '');
  assert.equal(normalizeExternalUrl('data:text/html,unsafe'), '');
  assert.equal(normalizeExternalUrl('not a url'), '');
});
