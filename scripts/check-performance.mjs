import { gzipSync } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'client', 'dist');
const manifest = JSON.parse(await readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'));
const entry = manifest['index.html'];
if (!entry) throw new Error('Vite entry manifest was not generated');

function collect(key, visited, assets) {
  if (visited.has(key)) return;
  visited.add(key);
  const item = manifest[key];
  if (!item) return;
  if (item.file) assets.push(item.file);
  for (const css of item.css ?? []) assets.push(css);
  for (const imported of item.imports ?? []) collect(imported, visited, assets);
}

async function compressedSize(assets) {
  let total = 0;
  for (const asset of new Set(assets)) total += gzipSync(await readFile(path.join(dist, asset))).byteLength;
  return total;
}

const initialAssets = [];
collect('index.html', new Set(), initialAssets);
const homeAssets = [...initialAssets];
collect('src/pages/Home.tsx', new Set(), homeAssets);

const initialGzipBytes = await compressedSize(initialAssets);
const homeRouteGzipBytes = await compressedSize(homeAssets);
const heroBytes = (await stat(path.join(root, 'client', 'public', 'images', 'hero-local.webp'))).size;
const mobileHeroBytes = (await stat(path.join(root, 'client', 'public', 'images', 'hero-local-800.webp'))).size;
const serviceNames = ['barba', 'corte-barba', 'corte-clasico', 'corte-infantil', 'corte-personalizado', 'degradado'];
const serviceThumbnailStats = await Promise.all(serviceNames.map((name) => (
  stat(path.join(root, 'client', 'public', 'images', `${name}-320.webp`))
)));
const serviceThumbnailBytes = serviceThumbnailStats.reduce((total, file) => total + file.size, 0);
const videoStats = await Promise.all(['Horizontal.mp4', 'Vertical.mp4'].map((name) => (
  stat(path.join(root, 'client', 'public', 'videos', name))
)));
const videoBytes = videoStats.map((file) => file.size);
const limits = {
  initialGzipBytes: 150 * 1024,
  homeRouteGzipBytes: 170 * 1024,
  heroBytes: 200 * 1024,
  mobileHeroBytes: 80 * 1024,
  serviceThumbnailBytes: 90 * 1024,
  videoBytes: 3 * 1024 * 1024,
};

console.info(JSON.stringify({
  initialGzipKb: Math.round(initialGzipBytes / 1024),
  homeRouteGzipKb: Math.round(homeRouteGzipBytes / 1024),
  heroKb: Math.round(heroBytes / 1024),
  mobileHeroKb: Math.round(mobileHeroBytes / 1024),
  serviceThumbnailsKb: Math.round(serviceThumbnailBytes / 1024),
  videosKb: videoBytes.map((size) => Math.round(size / 1024)),
  limitsKb: { initial: 150, homeRoute: 170, hero: 200, mobileHero: 80, serviceThumbnails: 90, video: 3072 },
}, null, 2));

if (
  initialGzipBytes > limits.initialGzipBytes
  || homeRouteGzipBytes > limits.homeRouteGzipBytes
  || heroBytes > limits.heroBytes
  || mobileHeroBytes > limits.mobileHeroBytes
  || serviceThumbnailBytes > limits.serviceThumbnailBytes
  || videoBytes.some((size) => size > limits.videoBytes)
) {
  throw new Error('Performance budget exceeded');
}
