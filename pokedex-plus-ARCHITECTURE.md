# Pokédex++ — Architecture

**Stack:** Next.js 14 (App Router) + Supabase (Postgres) + Vercel. Python ML via Vercel Python Runtime for the `/lab` inference endpoint. All sprites and cries self-hosted in `public/`.

**Core architectural decision:** Server Components by default. Client Components only where interactivity genuinely demands them (filters, team builder drag-drop, charts, sound toggle). Data fetching happens server-side via direct Supabase queries in RSCs; mutations go through Server Actions. Route Handlers only for the Python ML inference endpoint.

---

## 1. Route Map

```
/                         Landing — hero, featured Pokémon carousel, link to full dex
/pokedex                  Full dex grid with filters (type, gen, legendary, search)
/pokedex/[slug]           Detail view for a single Pokémon
/compare                  Side-by-side comparison of two Pokémon
/compare?a=25&b=150       Deep-linkable
/team                     Team builder — draft 6, see coverage analysis
/team/[code]              Shareable team view (read-only)
/lab                      ML mini-portfolio — model internals, predictions UI
/lab/predict              Interactive: input stats, get legendary prediction + BST estimate
/about                    Why this exists, credits, links to jleo.me and source
```

**Notes:**
- `/pokedex/[slug]` uses name-slug (`charizard`, `mr-mime`) not Pokédex number. SEO-friendlier, shareable.
- `/team/[code]` encodes the team as a short base64 of 6 dex numbers: `/team/006-009-003-065-143-094`. No DB write required for sharing.
- `/lab/predict` is separate from `/lab` to keep the interactive tool isolated from the explainer content.

---

## 2. Component Tree

```
app/
├── layout.tsx                      Root layout: fonts, theme provider, sound provider
├── page.tsx                        Landing
├── pokedex/
│   ├── page.tsx                    Grid view (RSC; filters are client children)
│   ├── loading.tsx                 Skeleton grid
│   └── [slug]/
│       ├── page.tsx                Detail view (RSC; interactive bits client)
│       └── not-found.tsx
├── compare/page.tsx
├── team/
│   ├── page.tsx                    Builder (client-heavy)
│   └── [code]/page.tsx             Read-only view (RSC)
├── lab/
│   ├── page.tsx                    Model internals explainer (RSC)
│   └── predict/page.tsx            Interactive predictor (client)
└── about/page.tsx

components/
├── layout/
│   ├── Nav.tsx                     Top nav with route links, theme/sound toggles
│   ├── ThemeToggle.tsx             Day/Night switcher
│   ├── SoundToggle.tsx             Global mute
│   ├── CRTOverlay.tsx              The optional CRT effect
│   └── Footer.tsx
│
├── pokedex/
│   ├── PokedexGrid.tsx             Server: fetches + renders list
│   ├── PokedexFilters.tsx          Client: type/gen/legendary/search, URL-synced
│   ├── PokedexCard.tsx             Server: single card, pixel-bordered
│   ├── TypeBadge.tsx               Server: reusable type pill
│   ├── StatBar.tsx                 Client: animated stepped fill
│   └── SpriteImage.tsx             Next/Image wrapper with pixel-rendering
│
├── detail/
│   ├── PokemonHero.tsx             Sprite + name + types + dex number
│   ├── StatBlock.tsx               All 6 base stats with bars + totals
│   ├── TypeEffectiveness.tsx       What this Pokémon resists / is weak to
│   ├── CryButton.tsx               Client: plays sound via Web Audio
│   ├── EvolutionChain.tsx          Horizontal sprite chain
│   └── RelatedPokemon.tsx          "Similar stats" — powered by ML feature vectors
│
├── team/
│   ├── TeamBuilder.tsx             Client: drag-drop slots, keyboard-accessible
│   ├── TeamSlot.tsx                One of six slots
│   ├── PokemonPicker.tsx           Modal picker with search
│   ├── TypeCoverageMatrix.tsx      The 18×18 grid
│   ├── DefensiveSummary.tsx        "Team resists X, weak to Y"
│   └── TeamStatRadar.tsx           Recharts radar
│
├── lab/
│   ├── ModelCard.tsx               Reusable: wraps each model's section
│   ├── FeatureImportanceChart.tsx  Pixel-art horizontal bars
│   ├── ConfusionMatrix.tsx         2×2 for legendary classifier
│   ├── ResidualPlot.tsx            Scatter for BST regressor
│   ├── LearningCurve.tsx           Train vs val over iterations
│   └── PredictorForm.tsx           Client: inputs → POST /api/predict
│
└── ui/
    ├── Button.tsx                  Primary/secondary/ghost
    ├── Card.tsx                    Pixel-bordered container
    ├── Input.tsx
    ├── Dialog.tsx                  Modal primitive
    ├── Toggle.tsx                  Pixel switch
    ├── Badge.tsx
    └── Skeleton.tsx                Loading states

lib/
├── supabase/
│   ├── server.ts                   Server-side client (uses service role for reads)
│   ├── client.ts                   Browser client (anon key, rarely used)
│   └── types.ts                    Generated DB types
├── pokemon/
│   ├── queries.ts                  All read queries (getAll, getBySlug, getByIds, etc.)
│   ├── types.ts                    Pokemon, Type, Stat interfaces
│   ├── type-chart.ts               18×18 effectiveness multipliers (static)
│   └── team-code.ts                encode/decode team share codes
├── ml/
│   ├── models.ts                   Loaded model metadata (for display in /lab)
│   └── predict.ts                  Client-side wrapper for POST /api/predict
├── sound/
│   ├── provider.tsx                React context: muted state
│   ├── beep.ts                     Web Audio generator
│   └── cries.ts                    Maps pokemon_id → /cries/{id}.ogg
└── utils/
    ├── cn.ts                       Class merge
    └── format.ts                   Stat formatters, type names, etc.
```

**Component count estimate:** ~40 components. That's the ceiling — anything beyond is a sign of over-decomposition.

---

## 3. Data Model (Supabase Schema)

Four tables. No user data. The team feature works via URL-encoded codes, so no auth is needed for MVP.

### `pokemon`

```sql
create table pokemon (
  id              smallint primary key,           -- national dex number
  slug            text unique not null,            -- "charizard", "mr-mime"
  name            text not null,                   -- "Charizard", "Mr. Mime"
  generation      smallint not null,               -- 1, 2, 3
  type_primary    text not null,                   -- "fire"
  type_secondary  text,                            -- "flying" or null
  hp              smallint not null,
  attack          smallint not null,
  defense         smallint not null,
  sp_attack       smallint not null,
  sp_defense      smallint not null,
  speed           smallint not null,
  base_stat_total smallint generated always as (
    hp + attack + defense + sp_attack + sp_defense + speed
  ) stored,
  height_dm       smallint,                        -- height in decimeters (api convention)
  weight_hg       smallint,                        -- weight in hectograms
  is_legendary    boolean not null default false,
  sprite_url      text not null,                   -- "/sprites/006.png"
  cry_url         text,                            -- "/cries/006.ogg" or null
  created_at      timestamptz default now()
);

create index pokemon_generation_idx on pokemon(generation);
create index pokemon_type_primary_idx on pokemon(type_primary);
create index pokemon_type_secondary_idx on pokemon(type_secondary);
create index pokemon_legendary_idx on pokemon(is_legendary) where is_legendary = true;
```

### `evolutions`

```sql
create table evolutions (
  id            serial primary key,
  from_id       smallint not null references pokemon(id),
  to_id         smallint not null references pokemon(id),
  trigger       text not null,                     -- "level-up", "stone", "trade", "friendship"
  trigger_value text,                              -- "36", "water-stone", null
  unique (from_id, to_id)
);
```

### `user_submissions` (the "add a Pokémon" feature, kept from original)

```sql
create table user_submissions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type_primary    text not null,
  type_secondary  text,
  hp              smallint not null,
  attack          smallint not null,
  defense         smallint not null,
  sp_attack       smallint not null,
  sp_defense      smallint not null,
  speed           smallint not null,
  predicted_bst           smallint,                -- from regressor
  predicted_legendary     boolean,                 -- from classifier
  predicted_legendary_prob real,                   -- 0.0-1.0
  created_at      timestamptz default now(),
  ip_hash         text                             -- rate limit + moderation
);

create index user_submissions_created_at_idx on user_submissions(created_at desc);
```

### `predictions_log` (for the `/lab/predict` page analytics)

```sql
create table predictions_log (
  id           uuid primary key default gen_random_uuid(),
  input_stats  jsonb not null,                     -- the 6 stats submitted
  predicted_bst           smallint,
  predicted_legendary_prob real,
  created_at   timestamptz default now()
);
```

### Row-Level Security

```sql
-- Public read on pokemon, evolutions
alter table pokemon enable row level security;
create policy "public read" on pokemon for select using (true);

alter table evolutions enable row level security;
create policy "public read" on evolutions for select using (true);

-- user_submissions: public read, insert via server action only (service role bypasses RLS)
alter table user_submissions enable row level security;
create policy "public read recent" on user_submissions
  for select using (created_at > now() - interval '30 days');
-- No insert policy for anon; server actions use service role.

-- predictions_log: no public read, inserts from server only
alter table predictions_log enable row level security;
-- Intentionally no select policy.
```

**Note on RLS:** server actions use the service role key (in Vercel env vars, never exposed), so they bypass RLS. RLS exists as defense-in-depth in case an anon client key ever leaks — it can read pokemon/evolutions/recent submissions but nothing else.

---

## 4. API Surface

Three patterns, used for three different things:

### Server Components (direct Supabase queries)

All reads. No API route, no fetch, no caching overhead beyond Next's default.

```ts
// app/pokedex/page.tsx
import { getAllPokemon } from '@/lib/pokemon/queries';
export default async function PokedexPage({ searchParams }) {
  const pokemon = await getAllPokemon({
    generation: searchParams.gen,
    type: searchParams.type,
    search: searchParams.q,
  });
  return <PokedexGrid pokemon={pokemon} />;
}
```

### Server Actions (mutations)

The two mutations in the entire app:

1. `submitPokemon(formData)` — adds to `user_submissions`, runs prediction, returns results
2. `logPrediction(stats)` — writes to `predictions_log` from `/lab/predict`

Both live in `app/actions.ts` or co-located with the page that uses them.

### Route Handler (Python ML inference)

One endpoint, because sklearn predictions must run in Python:

```
POST /api/predict
Body: { hp, attack, defense, sp_attack, sp_defense, speed }
Returns: { predicted_bst, predicted_legendary, predicted_legendary_prob }
```

**Implementation:** Vercel Python Runtime. A file at `api/predict.py` (note: traditional `/api/` directory for Python runtime, NOT `app/api/`). Pickled models in `api/models/`.

```
api/
├── predict.py                      entry point, handler function
├── models/
│   ├── bst_regressor.pkl           sklearn RandomForestRegressor
│   └── legendary_classifier.pkl    sklearn RandomForestClassifier
└── requirements.txt                scikit-learn==1.4.0, numpy
```

This is the one Python touchpoint. Everything else is TS.

---

## 5. Build-Time Data Pipeline

Pokémon data doesn't change. We fetch it from PokeAPI **once**, at build time, and store:
- Pokémon records in Supabase
- Sprites and cries as static files in `public/sprites/` and `public/cries/`

Scripts live in `scripts/`:

```
scripts/
├── fetch-pokemon.ts        Hits PokeAPI for Gen 1–3 (IDs 1–386), writes JSON
├── download-assets.ts      Downloads sprites + cries to public/
├── seed-supabase.ts        Inserts JSON into Supabase
└── train-models.py         Trains sklearn models on CSV export, pickles them
```

Run once at setup, commit artifacts. No runtime PokeAPI dependency.

**Decision point:** sprite variant to use. PokeAPI offers:
- `front_default` — current official artwork style
- `versions.generation-iii.emerald.front_default` — the Gen 3 sprites

My recommendation: use **Gen 3 Emerald sprites** for the entire dex. They're pixel art (matches the aesthetic), consistently styled across all 386 Pokémon, and they're the "golden era" Pokémon sprites. Gen 1 Pokémon rendered as Gen 3 sprites look better than their original ugly Gen 1 sprites.

---

## 6. ML Model Specs

Trained once at setup, stored as pickled sklearn models. Training data: the 386 Gen 1–3 Pokémon.

### Model A: Base Stat Total Regressor

- **Type:** `RandomForestRegressor`
- **Input features:** 6 base stats (HP, Atk, Def, SpA, SpD, Spe)... wait, that's circular (BST = sum of those).
- **Revised input:** type_primary (one-hot), type_secondary (one-hot, nullable), generation, is_legendary, height, weight. 24 features after encoding.
- **Target:** base_stat_total
- **Why:** given a Pokémon's type and physical characteristics, predict how strong it "should" be. A Dragonite-sized non-legendary should be stronger than a Pidgey-sized one.
- **Displayed in /lab:** feature importances (height and is_legendary will dominate), residual plot (overshoots and undershoots — where does the model get confused?).

### Model B: Legendary Classifier

- **Type:** `RandomForestClassifier`
- **Input features:** 6 base stats + base_stat_total + height + weight. 9 features.
- **Target:** is_legendary (boolean)
- **Why:** the original project's marquee ML feature. "Does this Pokémon feel legendary?"
- **Displayed in /lab:** confusion matrix (imbalanced dataset — ~15 legendaries out of 386, so this will show interesting failure modes), feature importances (BST and speed dominate), an interactive predictor.

Both models train in <5s on the dataset. Pickled size: <5MB combined.

### User-facing predictor (`/lab/predict`)

User adjusts 6 stat sliders, sees:
- Predicted BST
- Predicted legendary probability (gauge, 0-100%)
- "Closest real Pokémon" — nearest-neighbor match in stat-space (computed client-side from the full dataset, since it's already loaded for the comparison feature)

---

## 7. Caching & Performance

- **Static routes:** `/`, `/about` → build-time static.
- **`/pokedex`, `/pokedex/[slug]`:** ISR with long revalidation (Pokémon data doesn't change). `revalidate: 86400` (1 day).
- **`/team/[code]`:** dynamic, but the team data is in the URL so each unique URL is cached separately.
- **`/lab`:** static.
- **`/lab/predict`:** dynamic (form submissions). Form itself is static, submission round-trips to `/api/predict`.
- **`/compare`:** dynamic (depends on query params), but cached per `?a=X&b=Y` combo.

Sprites served via Next/Image with `image-rendering: pixelated` applied in CSS. Vercel's image CDN handles sizing.

### Performance budget

- Landing page: <100KB JS, <50KB CSS, LCP <1.5s on 4G
- Pokedex grid: <200KB total including sprites (they're ~2KB each, aggressively cached)
- `/lab`: can be heavier (<400KB) — charts library costs something

---

## 8. State Management

**No Redux, no Zustand, no Jotai.** Everything fits in:

- **URL state** for filters (`?gen=1&type=fire&q=char`). Shareable, back-button-friendly.
- **React context** for: theme (Day/Night), sound muted state, CRT overlay on/off. Three tiny providers.
- **Component local state** for: modals, inputs, team builder working state (commits on save).
- **Server state** from RSC — no client-side fetching library.

The team builder is the most stateful part of the app. It holds an array of up to 6 Pokémon ids in local state, plus a "working pick" when the picker modal is open. When the user hits "share," the state gets encoded into a URL and the user is redirected to `/team/[code]`. No server persistence; the URL *is* the save.

---

## 9. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...       (server-side only, Vercel Env)
```

No other secrets. No Mapbox, no third-party APIs at runtime.

---

## 10. Deployment Topology

```
┌─────────────────────────────────────────────┐
│  Vercel (same account as jleo.me)           │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Next.js app (pokedex.jleo.me?)       │  │
│  │  - RSC renders                        │  │
│  │  - Server Actions                     │  │
│  │  - Static sprites/cries from /public  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  /api/predict (Python Runtime)        │  │
│  │  - Loads pickled sklearn models       │  │
│  │  - Returns JSON predictions           │  │
│  └───────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────┐
│  Supabase (separate)     │
│  - pokemon               │
│  - evolutions            │
│  - user_submissions      │
│  - predictions_log       │
└──────────────────────────┘
```

### Domain strategy — decide later, doesn't block build

Three options:

1. **Subdomain:** `pokedex.jleo.me` — clean, professional, requires a DNS record in Namecheap.
2. **Path on jleo.me:** `jleo.me/pokedex-plus` — requires merging into About-Me repo or Vercel rewrites. Not recommended; complicates deploys.
3. **Separate domain:** `pokedexplus.vercel.app` initially, custom domain later.

I'd go with option 1. Cleanest for iteration, preserves the independence of the repo, and a subdomain is a standard recruiter signal for "this is a substantial thing."

### Embedding on jleo.me

Rather than iframing (cheap), add a dedicated Projects route on jleo.me that links out to `pokedex.jleo.me` with a thumbnail + description + live link. Let the project live at full browser dimensions where it was designed to live.

---

## 11. Risks (flagged for PLAN.md to address)

1. **Vercel Python Runtime size limits.** sklearn + numpy pickled models can push against the 250MB unzipped deployment limit. Mitigation: pickle with `joblib` compression, use smaller model variants, profile early.

2. **Supabase free tier limits.** 500MB DB (we'll use <10MB), 5GB bandwidth (plenty), 2GB storage (unused — sprites are in Vercel). Safe.

3. **Pokémon cry file sizes.** 386 × ~15KB = ~6MB in repo. Acceptable but not trivial. Alternative: lazy-load from CDN. Decision deferred to PLAN.

4. **Team builder drag-drop accessibility.** Drag-drop + keyboard + screen reader is a genuinely hard problem. Will use `dnd-kit` which has decent a11y primitives. Budget a full session for this alone.

5. **Press Start 2P font weight.** It's a 45KB WOFF2. Self-host, subset to ASCII-only (drops to ~12KB).
