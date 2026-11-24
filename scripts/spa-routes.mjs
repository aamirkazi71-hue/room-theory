// GitHub Pages has no SPA rewrites. Copy the built index.html to every known
// route (so each returns HTTP 200 for visitors, crawlers and link previews),
// and to 404.html for anything else.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const dist = 'dist';
const read = (f) => readFileSync(f, 'utf8');
const ids = (file, key) => [...read(file).matchAll(new RegExp(`${key}: '([a-z0-9-]+)'`, 'g'))].map((m) => m[1]);

// Products are the only `id: '…'` entries with a `model:` on the same line.
const products = [...read('src/data/furniture.ts').matchAll(/id: '([a-z0-9-]+)', name: '[^']+', model:/g)].map((m) => m[1]);
const spaces = ids('src/data/spaces.ts', 'slug');
const articles = ids('src/data/journal.ts', 'slug');

const routes = [
  'spaces', 'studio', 'collection', 'journal', 'about',
  'legal/privacy', 'legal/terms', 'legal/cookies',
  ...spaces.map((s) => `spaces/${s}`),
  ...products.map((p) => `collection/${p}`),
  ...articles.map((a) => `journal/${a}`),
];

const index = join(dist, 'index.html');
for (const r of routes) {
  const target = join(dist, r, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(index, target);
}
copyFileSync(index, join(dist, '404.html'));
console.log(`spa-routes: ${routes.length} routes (${spaces.length} spaces, ${products.length} products, ${articles.length} articles) + 404.html`);
