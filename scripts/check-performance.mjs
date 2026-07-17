import { gzipSync } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'client', 'dist');
const manifest = JSON.parse(await readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'));
const entry = manifest['index.html'];
if (!entry) throw new Error('Vite entry manifest was not generated');

const visited = new Set();
const assets = [];
function collect(key) {
  if (visited.has(key)) return;
  visited.add(key);
  const item = manifest[key];
  if (!item) return;
  if (item.file) assets.push(item.file);
  for (const css of item.css ?? []) assets.push(css);
  for (const imported of item.imports ?? []) collect(imported);
}
collect('index.html');

let initialGzipBytes = 0;
for (const asset of new Set(assets)) {
  initialGzipBytes += gzipSync(await readFile(path.join(dist, asset))).byteLength;
}
const heroBytes = (await stat(path.join(root, 'client', 'public', 'images', 'hero-local.webp'))).size;
const limits = { initialGzipBytes: 150 * 1024, heroBytes: 200 * 1024 };

console.info(JSON.stringify({
  initialGzipKb: Math.round(initialGzipBytes / 1024),
  heroKb: Math.round(heroBytes / 1024),
  limitsKb: { initial: 150, hero: 200 },
}, null, 2));

if (initialGzipBytes > limits.initialGzipBytes || heroBytes > limits.heroBytes) {
  throw new Error('Performance budget exceeded');
}
