# Room Theory

**Live:** https://aamirkazi71-hue.github.io/room-theory/ · Arabic: https://aamirkazi71-hue.github.io/room-theory/?lang=ar

An interior design studio site and real-time 3D room configurator.
React 18 · Vite · TypeScript · Tailwind · Three.js / React Three Fiber / Drei · GSAP + ScrollTrigger · Zustand.

```bash
npm install
npm run dev        # http://localhost:5183
npm run build      # typecheck + production build
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Editorial homepage: hero, featured spaces, scroll-driven 3D studio demo, horizontal collections, material stories, journal, expanding CTA |
| `/spaces`, `/spaces/:slug` | Space gallery with URL-driven filters (room, style, size, palette); detail with generated floor plan and live 3D preview |
| `/studio` | The configurator (full-screen) |
| `/collection`, `/collection/:id` | Furniture with category filter and sort; product page with live 3D viewer, finishes, dimension drawing, **Place in my room** |
| `/journal`, `/journal/:slug` | Magazine index with category filter; long-form articles |
| `/about`, `/legal/:doc` | Studio and legal pages |

## The studio

- Room shell built from real geometry: walls extruded with window/door openings, skirting, sills, ceiling. Walls between the camera and the room are moved to a hidden layer so they still cast shadows (daylight only enters through windows).
- 25 procedurally modelled products (`src/components/configurator/Furniture/models.tsx`), all sharing cached geometry and materials.
- Placement rules (`src/lib/placement.ts`): room bounds, floor collisions with sliding, chairs that tuck under tables, wall snapping for art, surface stacking for lamps/vases/books, ceiling items.
- Materials are procedural (`src/lib/textures.ts`) — the same generator produces UI swatches, 3D textures and the homepage material plates.
- Lighting presets ease between daylight → night; lamps switch on as the light fades.
- History (undo/redo), autosave, save/rename/load projects, reset/clear, PNG render export, CSV shopping list export.
- Keyboard: Ctrl/Cmd+Z / Shift+Z / Y, Ctrl+S, Ctrl+D, Delete, R / Shift+R, arrow keys (Shift = 25 cm), P preview, Esc.
- URL hand-off: `?space=slug`, `?room=type`, `?project=id`, `?place=productId&m=slot:material,…`.

## Data & assets

- Photography is centralised in `src/data/assets.ts` (temporary Unsplash imagery, Unsplash License). Swap `src` per key for production photography; keep `alt` text descriptive.
- Product imagery is rendered at runtime from the 3D models (`ThumbnailStudio.tsx`) so the collection always matches the studio.
- Products, spaces/templates, materials and journal content live in `src/data/`.
- Contact details and social URLs: `src/data/site.ts`.

## Cloud saving (Supabase)

Saved projects go through `ProjectRepository` in `src/store/projects.ts`. Implement it against a `projects` table
(`id uuid, user_id uuid, name text, design jsonb, thumbnail text, created_at, updated_at`) and call
`setProjectRepository(...)` after sign-in; the UI needs no changes. The newsletter form stores locally until a provider is connected (`Footer.tsx`).

## Deployment

Every push to `main` builds and publishes the site to GitHub Pages (`.github/workflows/deploy.yml`).
The build runs with `BASE_PATH=/room-theory/`; `scripts/spa-routes.mjs` then writes an `index.html` for every known route so deep links return HTTP 200.
If you add a page or route, add it to that script. If you rename the repository, the base path follows automatically, but update the two `hreflang` links in `index.html`.

## Languages

English and Arabic (right-to-left). Translations live in `src/i18n/`, keyed by the English text; counted strings use Arabic plural forms in `ar-plurals.ts`.
