import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(currentDirectory, '../..');
export const taxonomyPath = path.join(projectRoot, 'config/taxonomy.json');

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function loadTaxonomy() {
  return readJson(taxonomyPath);
}

export function resolveProjectPath(relativePath) {
  return path.resolve(projectRoot, relativePath);
}
