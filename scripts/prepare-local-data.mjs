import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { resolveProjectPath, taxonomyPath } from './lib/paths.mjs';

const outputDirectory = resolveProjectPath('website/data');
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  copyFile(resolveProjectPath('fixtures/issues.sample.json'), path.join(outputDirectory, 'issues.json')),
  copyFile(taxonomyPath, path.join(outputDirectory, 'taxonomy.json'))
]);

console.log('本機示範資料已寫入 website/data/');
