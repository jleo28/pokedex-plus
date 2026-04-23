# Pokédex++

A rebuild of my 2023 ITP-216 final project. The original was a Flask app. This one has Next.js 14, Supabase, two sklearn ML models, and a retro pixel aesthetic.

**Live:** [pokedexpp.vercel.app](https://pokedexpp.vercel.app)  
**Repo:** [github.com/jleo28/pokedex-plus](https://github.com/jleo28/pokedex-plus)

---

## What it does

- **Pokédex** — Browse all 386 Gen 1–3 Pokémon with type/gen/legendary filters and search. Each detail page shows stats, type effectiveness, evolution chain, and similar Pokémon.
- **Team Builder** — Build a party of 6 with drag-to-reorder (keyboard accessible), type coverage matrix, defensive weakness summary, and stat radar. Teams are shareable via URL.
- **Compare** — Side-by-side stat comparison of any two Pokémon.
- **ML Lab** — Two trained models with feature importance charts, residual plots, and learning curves. Interactive predictor: dial in six stats and get a BST estimate + legendary probability.
- **Submit** — Invent a Pokémon, get it judged by the models, see it in the community gallery.
- **Day/Night theme** — Day palette is warm paper; Night palette collapses to DMG green monochrome. Optional CRT scanline overlay.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Styling | CSS Modules, no Tailwind |
| Database | Supabase (Postgres + RLS) |
| ML inference | Vercel Python Runtime (`api/predict.py`) |
| ML training | scikit-learn 1.4 RandomForest (`scripts/train-models.py`) |
| Drag-drop | @dnd-kit/core + @dnd-kit/sortable |
| Charts | recharts |
| Data source | PokéAPI (Gen 1–3, fetched once, committed to `data/pokemon.json`) |
| Fonts | Press Start 2P (local WOFF2), IBM Plex Mono, Inter |
| Deploy | Vercel (Node + Python runtimes) |

## Local dev setup

### 1. Clone and install

```bash
git clone https://github.com/jleo28/pokedex-plus.git
cd pokedex-plus
npm install
```

### 2. Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor. This creates the four tables (`pokemon`, `evolutions`, `user_submissions`, `predictions_log`) with RLS policies.

### 4. Seed Supabase

```bash
npx tsx scripts/seed-supabase.ts
```

Pokémon data is already in `data/pokemon.json`. Sprites are in `public/sprites/`, cries in `public/cries/`.

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

### Regenerating data (optional)

```bash
npx tsx scripts/fetch-pokemon.ts     # re-fetch from PokéAPI
npx tsx scripts/download-assets.ts   # re-download sprites + cries
python scripts/train-models.py       # re-train models (requires Python + scikit-learn)
```

## ML models

Two RandomForest models trained on all 386 Gen 1–3 Pokémon:

- **BST Regressor** — predicts Base Stat Total from height, weight, generation, and type. R² ≈ 0.59 cross-validated. Height is the strongest feature by a wide margin, which I didn't expect.
- **Legendary Classifier** — classifies legendary status from the six base stats only. F1 ≈ 0.83. Class imbalance is severe (15/386 legendaries), so recall matters more than accuracy here.

Models are pickled to `api/models/` and served via `api/predict.py` on Vercel's Python runtime. Cold start is ~20s. Warm requests are under 100ms.

## Project history

The original version was built for USC ITP-216 (Intro to Machine Learning) in Spring 2023 — a Flask app with a basic Pokédex, a stat predictor, and a team builder that didn't quite work. This is a full rewrite.

## Credits

- Pokémon data and sprites: [PokéAPI](https://pokeapi.co/)
- Not affiliated with Nintendo, Game Freak, or The Pokémon Company.

## License

MIT
