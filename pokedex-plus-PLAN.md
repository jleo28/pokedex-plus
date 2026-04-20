# Pokédex++ — Execution Plan

**Target deploy:** `pokedexpp.vercel.app`
**Repo:** `github.com/jleo28/pokedex-plus` (fresh, no history from the Flask original)
**Executor:** Sonnet in Claude Code, pointed at this file

**Ground rules for the executor:**

1. One task = one atomic commit. Commit message format: `task N: short description`.
2. Work through tasks in order. If a task depends on an earlier one that isn't done, stop and flag it.
3. Each task has explicit **acceptance criteria**. Don't move on until they're met. Run the specified verification before committing.
4. If a task blocks on a decision not specified here, stop and ask. Don't guess.
5. **Gitflow is enforced per-branch, not per-task.** See Gitflow Rules below. Never commit directly to `develop` or `main`.
6. The working directory is `C:\Dev\pokedex-plus\`. Not OneDrive. PowerShell uses `Remove-Item -Recurse -Force`, not `rm -rf`.
7. Refer to `DESIGN.md` and `ARCHITECTURE.md` in the repo root constantly. They are the source of truth. If they conflict with this PLAN, the design docs win and this PLAN needs a correction.

**Estimated scope:** 42 atomic tasks across 10 branches (8 feature + 2 spike), ~10 PRs total. Time per task varies from 15min to 2hrs. Plan for 2-3 tasks per sitting.

---

## Gitflow Rules

### Branch topology

```
main ────────────────────────────────────●───────────●────
                                         │           │
develop ──●──●──●──●──●──●──●──●─●──●──●──●──●──●──●─●────
          │  │  │  │  │  │  │  │  │  │  │     │  │   │
          A  B  S1 C  D  E  S2 F  G  H  I     J  K   L

A:  feature/foundation          (tasks 1-6)
B:  feature/data-layer          (tasks 7-10)
S1: spike/python-runtime        (tasks 11-12) ← risky, isolated
C:  feature/pokedex-core-ui     (tasks 13-17)
D:  feature/pokedex-detail      (task 18)
E:  feature/team-builder-base   (tasks 19-20)
S2: spike/team-a11y-dnd         (task 21)   ← risky, isolated
F:  feature/team-coverage       (tasks 22-24)
G:  feature/ml-lab              (tasks 25-30)
H:  feature/compare-submit      (tasks 31-34)
I:  feature/signature-polish    (tasks 35-39)
J:  feature/launch-hygiene      (tasks 40-41)
K:  hotfix/*                    (reserved for launch-blockers, not pre-planned)
L:  release/1.0                 (merges develop → main for launch)

Task 42 happens in the About-Me repo, not this one.
```

### Rules

1. **`main` is production.** Every commit on `main` is what's live at `pokedexpp.vercel.app`. Only merged via release branches or hotfixes.
2. **`develop` is integration.** All feature work merges here first. Vercel deploys `develop` to a preview URL.
3. **Feature branches** (`feature/*`) branch from `develop`, merge back into `develop` via PR.
4. **Spike branches** (`spike/*`) are for isolating risky work where the approach isn't certain. If a spike succeeds, merge like a feature branch. If it fails, abandon cleanly without polluting `develop`. Use for: Python runtime deploy (Task 12), drag-drop accessibility (Task 21).
5. **Release branches** (`release/*`) merge `develop` into `main`. Only used at the end.
6. **Hotfix branches** (`hotfix/*`) branch from `main`, merge into both `main` and `develop`. Reserved for production-down situations.

### PR ceremony (light)

- Title: `[branch type] short description` — e.g., `feature: add pokedex core UI`
- Description: 2-4 bullet points of what changed and why. Screenshots only for visual changes.
- **Merge style: "Create a merge commit"** (not squash). Preserves the per-task commit history inside the branch so the git log tells the story task-by-task.
- Self-review: quick scroll through the diff in the GitHub UI before merging. Catch `console.log`s, commented-out code, TODOs that should be issues.
- No required reviewers (solo project). Merge when green.

### PR template (save as `.github/PULL_REQUEST_TEMPLATE.md` in Task 1)

```markdown
## What
<!-- One sentence: what does this PR add/change? -->

## Why
<!-- One sentence: why does this matter? -->

## Tasks completed
<!-- Reference task numbers from PLAN.md -->
- Task N: ...

## Screenshots
<!-- For visual changes only. Delete this section otherwise. -->

## Verification
<!-- How you verified acceptance criteria. Usually: "All task acceptance criteria met; npm run build passes." -->
```

### Commit message format

```
task N: short imperative description

Optional body paragraph explaining the why,
if the what isn't obvious from the diff.
```

Examples:
- `task 5: add Button/Card/Input/Badge/Toggle primitives`
- `task 12: wire /api/predict endpoint with pickled models`
- `task 22: build TypeCoverageMatrix with animated fills`

---

## Branch A — `feature/foundation` (Tasks 1–6)

**Goal:** a deployed Next.js app at `pokedexpp.vercel.app` with the design system CSS in place and a placeholder landing page.

**Branch off:** `develop` (which branches off `main` on first setup)

### Task 1: Initialize repo and Next.js 14 app

- `npx create-next-app@14 pokedex-plus` with: TypeScript yes, Tailwind **no** (we're using CSS variables + CSS modules), App Router yes, `src/` dir **no**, import alias `@/*` yes.
- Initialize git, create `.github/PULL_REQUEST_TEMPLATE.md` with the template from Gitflow Rules above.
- First commit on `main`: `task 1: initialize Next.js 14 app`.
- Create `develop` branch from `main`, push both to `github.com/jleo28/pokedex-plus`.
- Create `feature/foundation` from `develop`. All remaining tasks in this branch commit here.
- **Acceptance:** `npm run dev` renders the default Next.js page at localhost:3000; repo exists on GitHub with `main` and `develop` branches; `.github/PULL_REQUEST_TEMPLATE.md` present.

### Task 2: Deploy to Vercel

- Connect the GitHub repo to Vercel. Set production branch to `main`, preview branches include `develop` and all others.
- Project name: `pokedex-plus`. Default domain becomes `pokedex-plus.vercel.app`, rename in Vercel settings to `pokedexpp.vercel.app` if available. If not, document the actual domain in README and proceed.
- Commit: `task 2: configure Vercel deploy`.
- **Acceptance:** pushing to `main` deploys to production; pushing to `develop` deploys to a preview URL; `feature/foundation` pushes also get preview URLs.

### Task 3: Install Supabase, configure env

- `npm install @supabase/supabase-js`
- Create Supabase project: `pokedex-plus`.
- Add to Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only).
- Create `.env.local` with the same vars for local dev. Verify `.env.local` is in `.gitignore`.
- Create `lib/supabase/server.ts` and `lib/supabase/client.ts` per ARCHITECTURE §4.
- Commit: `task 3: wire Supabase client and env`.
- **Acceptance:** a throwaway server component can read from a test `select 1` query; no secrets committed.

### Task 4: Set up design tokens and global CSS

- Create `app/globals.css`. Paste all CSS custom properties from DESIGN.md §1 (Day palette, Night palette, type colors).
- Create `app/fonts.ts` using `next/font/google` for Inter and IBM Plex Mono, and `next/font/local` for Press Start 2P (download the WOFF2, subset to ASCII using `glyphhanger` or similar, store in `public/fonts/`).
- Apply font variables in `app/layout.tsx` on the `<body>` tag.
- Add the `--text-*`, `--space-*`, `--motion-*` tokens from DESIGN §2, §3, §5.
- Commit: `task 4: add design tokens and fonts`.
- **Acceptance:** in the browser devtools, inspecting `:root` shows all tokens; `getComputedStyle(body).fontFamily` resolves to Inter.

### Task 5: Build UI primitives (Button, Card, Input, Badge, Toggle)

- Create `components/ui/` with each primitive per DESIGN §4.
- Chunky pixel borders (3px solid `--border`, 2px offset drop shadow) as the Button/Card signature.
- Each component has a `variants` prop where relevant (Button: primary/secondary/ghost).
- Use CSS modules (`Button.module.css`) rather than Tailwind.
- Write **no tests**, visually verify in a scratch `app/preview/page.tsx` that you'll delete in Task 6.
- Commit: `task 5: add UI primitives`.
- **Acceptance:** `app/preview` shows all primitives in Day mode; visually matches DESIGN.md descriptions; no TypeScript errors.

### Task 6: Landing page skeleton + delete preview

- Replace `app/page.tsx` with a minimal landing: site title "Pokédex++" in Press Start 2P, a one-line tagline in Inter, a placeholder "Browse the Dex" button that links to `/pokedex` (which doesn't exist yet, the link 404s, that's fine).
- Delete `app/preview/page.tsx`.
- Commit: `task 6: add landing skeleton, remove preview route`.
- **Acceptance:** deployed Vercel preview URL renders the landing; Lighthouse score 90+ on Performance and Accessibility.

**→ Open PR: `feature/foundation` → `develop`.** Title: `feature: foundation (design system + landing)`. Merge with merge commit.

---

## Branch B — `feature/data-layer` (Tasks 7–10)

**Goal:** all 386 Pokémon in Supabase with sprites and cries self-hosted.

**Branch off:** `develop` (after Branch A merged)

### Task 7: Write `scripts/fetch-pokemon.ts`

- Script hits PokeAPI for Pokémon IDs 1–386.
- For each, fetch: name, types, stats, height, weight, is_legendary (derive from species endpoint `is_legendary` or `is_mythical`), generation, sprite URL (use `versions.generation-iii.emerald.front_default`), cry URL (use `cries.legacy`).
- Write output to `data/pokemon.json`.
- **Rate limit:** PokeAPI is free but be polite, throttle to 10 req/sec, add retry logic.
- Commit: `task 7: fetch Pokémon data from PokeAPI`.
- **Acceptance:** `data/pokemon.json` exists with 386 entries; spot-check that Charizard (id 6) has `type_primary: "fire"`, `type_secondary: "flying"`, and a valid sprite URL.

### Task 8: Write `scripts/download-assets.ts`

- Reads `data/pokemon.json`, downloads all sprite images to `public/sprites/{id}.png` and cries to `public/cries/{id}.ogg`.
- Skip files that already exist (idempotent).
- **Size check:** after run, report total size of `public/sprites/` and `public/cries/`. If cries exceed 15MB total, flag for decision on lazy-loading vs. self-hosting.
- Commit: `task 8: download sprites and cries locally`.
- **Acceptance:** `public/sprites/006.png` is a Gen 3 Charizard sprite; `public/cries/006.ogg` plays a Charizard cry.

### Task 9: Create Supabase schema

- In Supabase SQL editor, run the DDL from ARCHITECTURE §3: `pokemon`, `evolutions`, `user_submissions`, `predictions_log` tables plus indexes and RLS policies.
- Generate TypeScript types: `npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts`.
- Commit: `task 9: add Supabase schema and generated types`.
- **Acceptance:** tables exist; `lib/supabase/types.ts` contains the correct interfaces; RLS policies are enabled (verify via Supabase dashboard).

### Task 10: Write `scripts/seed-supabase.ts`

- Reads `data/pokemon.json`, inserts into the `pokemon` table using the service role key.
- Rewrites `sprite_url` to `/sprites/{id}.png` and `cry_url` to `/cries/{id}.ogg` (local paths, not PokeAPI URLs).
- Separately, fetches evolution chains from PokeAPI and populates `evolutions`. This can be a second pass in the same script.
- Commit: `task 10: seed Supabase with Pokémon and evolutions`.
- **Acceptance:** Supabase `pokemon` table has 386 rows; `select count(*) from evolutions where from_id = 1` returns 2 (Bulbasaur → Ivysaur → Venusaur).

**→ Open PR: `feature/data-layer` → `develop`.** Title: `feature: data layer (PokeAPI fetch, Supabase seed)`. Merge with merge commit.

---

## Branch S1 — `spike/python-runtime` (Tasks 11–12)

**Goal:** prove Vercel's Python Runtime can host sklearn models within the 250MB unzipped limit, before building UI against the endpoint.

**Branch off:** `develop` (after Branch B merged). This is a **spike**, if it fails, abandon and pivot to simpler models or an alternative runtime.

### Task 11: Write `scripts/train-models.py`

- Python script (standalone, runs locally with your existing Python env; not deployed).
- Loads Pokémon data from Supabase or from `data/pokemon.json`.
- Trains `RandomForestRegressor` for BST prediction (features per ARCHITECTURE §6 Model A).
- Trains `RandomForestClassifier` for legendary prediction (features per Model B).
- Pickles both to `api/models/bst_regressor.pkl` and `api/models/legendary_classifier.pkl` using `joblib.dump` with `compress=3`.
- Exports feature importances and cross-val metrics to `data/model-stats.json` (used later by `/lab` for display).
- Commit: `task 11: train and pickle sklearn models`.
- **Acceptance:** both `.pkl` files exist and are <5MB combined; `model-stats.json` contains feature importances for each model.

### Task 12: Scaffold Python API route

- Create `api/predict.py` using Vercel Python Runtime conventions (handler function, request/response objects).
- Loads both pickled models at cold start.
- Endpoint accepts `POST` with JSON body `{ hp, attack, defense, sp_attack, sp_defense, speed }`, returns `{ predicted_bst, predicted_legendary, predicted_legendary_prob }`.
- Create `api/requirements.txt` with pinned `scikit-learn==1.4.0`, `numpy`, `joblib`.
- **Deploy check:** push the spike branch, verify Vercel's preview deploy without hitting the 250MB unzipped limit. If it does, try `joblib` with higher compression, or swap `RandomForest` for `LinearRegression`/`LogisticRegression` (smaller pickle).
- Commit: `task 12: add /api/predict Python endpoint`.
- **Acceptance:** `curl <preview-url>/api/predict -X POST -H "Content-Type: application/json" -d '{"hp":78,"attack":84,"defense":78,"sp_attack":109,"sp_defense":85,"speed":100}'` returns a JSON prediction with non-null values.

**→ Open PR: `spike/python-runtime` → `develop`.** Title: `spike: Python runtime for ML inference`. PR description must explicitly state: "Spike succeeded: deploy size = X MB, cold start = Y ms. Proceed with plan as written." **If it failed:** close the PR without merging, keep the branch for reference, and open an issue titled "ML inference approach, spike failed, need alternative" with details. Do not continue to Branch C until this is resolved.

---

## Branch C — `feature/pokedex-core-ui` (Tasks 13–17)

**Goal:** `/pokedex` renders all 386 Pokémon with working filters.

**Branch off:** `develop` (after Branches B and S1 merged)

### Task 13: Build reusable `TypeBadge` and `SpriteImage` components

- `TypeBadge`: takes a type name, renders a rectangular pill with the type color (from the type palette in DESIGN §1), 2px darker border, PS2P uppercase text.
- `SpriteImage`: wraps `next/image` with `style={{ imageRendering: 'pixelated' }}` and correct alt text (the Pokémon's name, per DESIGN §9).
- Commit: `task 13: add TypeBadge and SpriteImage components`.
- **Acceptance:** rendered on a scratch page, both components look correct for a variety of inputs.

### Task 14: Build `StatBar` component (animated, stepped)

- Props: `value` (0-255), `maxValue` (default 255), `label`, `color` (optional, defaults to `--accent`).
- Renders a horizontal bar split into 10 discrete segments.
- On mount, fills from 0 to `value` using `animation: fill 400ms steps(10, end)`.
- Respects `prefers-reduced-motion`, fills instantly.
- Commit: `task 14: add animated StatBar component`.
- **Acceptance:** on a scratch page, a StatBar with `value={120}` fills in 10 visible steps over 400ms; reduced-motion toggle eliminates the animation.

### Task 15: Build `PokedexCard` component

- Props: one `Pokemon` object.
- Layout: sprite on left, name + dex number + types on right, stats bar preview below (HP only, compact).
- Full pixel-border card style per DESIGN §4.
- Wraps in `<Link href={/pokedex/${slug}}>`.
- Commit: `task 15: add PokedexCard component`.
- **Acceptance:** rendered on a scratch page with 3 sample Pokémon, cards are visually aligned, link correctly, and animate in (use a simple scroll-triggered fade, reuse the jleo.me `FadeIn` pattern).

### Task 16: Build `/pokedex` page with server-side data fetch

- `app/pokedex/page.tsx` is an async RSC.
- Calls `getAllPokemon()` from `lib/pokemon/queries.ts` (create this).
- Renders a grid of `PokedexCard` components.
- Responsive: 1-col mobile, 2-col tablet, 3-col desktop.
- Add `app/pokedex/loading.tsx` that renders a 12-card skeleton grid.
- Commit: `task 16: add /pokedex grid page`.
- **Acceptance:** `/pokedex` renders all 386 Pokémon; scroll performance is smooth; Network tab shows sprites lazy-loaded via Next/Image.

### Task 17: Build `PokedexFilters` client component

- Filter chips: Type (18 options + "All"), Generation (1, 2, 3, "All"), Legendary (yes/no/all), Search (debounced text input).
- URL-synced: `/pokedex?gen=1&type=fire&q=char&legendary=no`.
- Uses `useRouter` and `useSearchParams` from `next/navigation` to push state.
- `getAllPokemon()` reads these search params on the server and returns filtered results.
- Commit: `task 17: add URL-synced filters`.
- **Acceptance:** changing filters updates the URL and the rendered list; back button restores prior filter state; "fire + gen 1" returns Charmander/Charmeleon/Charizard/Vulpix/Ninetales/Growlithe/Arcanine/Ponyta/Rapidash/Magmar/Moltres (11).

**→ Open PR: `feature/pokedex-core-ui` → `develop`.** Title: `feature: Pokédex grid + filters`. Merge with merge commit.

---

## Branch D — `feature/pokedex-detail` (Task 18)

**Goal:** `/pokedex/[slug]` renders a detail view for each Pokémon.

**Branch off:** `develop` (after Branch C merged). Single-task branch, it's a big enough scope to warrant its own PR.

### Task 18: Build `/pokedex/[slug]` detail page

- Server component fetches by slug.
- Layout: `PokemonHero` (sprite, name, dex #, types) at top; `StatBlock` (all 6 stats with bars); `TypeEffectiveness` (computed from the static type chart); `CryButton` (client component, plays `/cries/{id}.ogg`, but sound system isn't wired yet, so this is a stub that just plays audio on click for now); `EvolutionChain` (horizontal sprite chain with arrows); `RelatedPokemon` (placeholder, "Coming soon", filled in Task 34).
- Sprite on detail page renders at 4x via CSS, animated idle bob (rises 2px, holds, drops 2px, loops 1.2s, respects `prefers-reduced-motion`).
- Add `not-found.tsx`.
- Commit: `task 18: add /pokedex/[slug] detail page`.
- **Acceptance:** `/pokedex/charizard` renders correctly; stats add up to 534 BST; clicking the cry button plays audio; evolution chain shows Charmander → Charmeleon → Charizard with arrows.

**→ Open PR: `feature/pokedex-detail` → `develop`.** Title: `feature: Pokémon detail page`. Merge with merge commit.

**Checkpoint, demoable state.** After this PR merges, the core browsing experience works. If you stop here, the project is a "Pokédex with filters and detail views."

---

## Branch E — `feature/team-builder-base` (Tasks 19–20)

**Goal:** team builder UI with slots and a picker modal. No drag-drop yet.

**Branch off:** `develop` (after Branch D merged)

### Task 19: Install `@dnd-kit/core` and scaffold team state

- `npm install @dnd-kit/core @dnd-kit/sortable`.
- Create `components/team/TeamBuilder.tsx` with local state: `team: (Pokemon | null)[6]`.
- Render 6 `TeamSlot` components in a horizontal row. Each slot is either empty (shows "+ Add") or filled (shows sprite + name + small X to remove).
- Commit: `task 19: scaffold TeamBuilder with slots`.
- **Acceptance:** clicking "+" shows a placeholder alert; X removes; no drag yet.

### Task 20: Build `PokemonPicker` modal

- Opens when user clicks empty slot.
- Modal contains a search input + scrollable grid of all 386 Pokémon (reuse `PokedexCard` in a compact variant).
- Clicking a Pokémon fills the slot and closes the modal.
- Implements proper focus trap, ESC to close, click-outside-to-close.
- Commit: `task 20: add PokemonPicker modal`.
- **Acceptance:** opening picker, typing "char", clicking Charizard fills the slot with Charizard.

**→ Open PR: `feature/team-builder-base` → `develop`.** Title: `feature: team builder slots + picker`. Merge with merge commit.

---

## Branch S2 — `spike/team-a11y-dnd` (Task 21)

**Goal:** prove accessible drag-drop works with `dnd-kit`. If it's taking more than a session, fall back to click-to-place.

**Branch off:** `develop` (after Branch E merged). This is a **spike**, if it fails, abandon and implement click-to-reorder as the fallback.

### Task 21: Add drag-to-reorder with keyboard accessibility

- Use `dnd-kit` `SortableContext` around the 6 slots.
- Enable mouse/touch drag between slots.
- Ensure keyboard navigation: Tab to focus a slot, Space to pick up, arrow keys to move, Space to drop.
- Add screen reader announcements on pickup/drop.
- Commit: `task 21: add accessible drag-to-reorder`.
- **Acceptance:** keyboard-only user can reorder the team; screen reader announces each action.
- **Time cap:** if this isn't working after one full sitting (~4 hours), close the spike, open an issue, and implement the fallback in a new `feature/team-reorder-fallback` branch: click a slot to "pick up," click another slot to swap. No drag.

**→ Open PR: `spike/team-a11y-dnd` → `develop`.** Title: `spike: accessible drag-drop for team builder`. PR description states the outcome: "Spike succeeded, merging" OR "Spike failed, see fallback branch." Merge or close accordingly.

---

## Branch F — `feature/team-coverage` (Tasks 22–24)

**Goal:** coverage analysis and shareable team URLs.

**Branch off:** `develop` (after Branch S2 resolved)

### Task 22: Build `TypeCoverageMatrix` component

- 18×18 grid: rows = "offensive type" (your Pokémon's attack types), cols = "defensive type" (opponent's type).
- For each cell, compute effectiveness (0, 0.25, 0.5, 1, 2, 4) using the static type chart in `lib/pokemon/type-chart.ts` and your team's move type coverage (approximate: use each Pokémon's own types as its "moves" for MVP; can upgrade later to learnset data).
- Color fills: green for super-effective, gray for neutral, red for resisted, black for immune. Pixel-stepped fill animation when team changes.
- On mobile, collapse to a vertical list per DESIGN §8.
- Commit: `task 22: add TypeCoverageMatrix`.
- **Acceptance:** a team with Charizard + Blastoise + Venusaur shows Fire/Water/Grass coverage against all 18 defensive types; empty team shows all gray.

### Task 23: Build `DefensiveSummary` and `TeamStatRadar`

- `DefensiveSummary`: for each of the 18 types, count how many team members resist / are weak to / are immune. Render as a sorted list highlighting team vulnerabilities ("3 Pokémon weak to Rock").
- `TeamStatRadar`: use `recharts` (install: `npm install recharts`). Radar with 6 axes (HP, Atk, Def, SpA, SpD, Spe), plotting team sum per axis. Compare against "average team" baseline (precomputed: mean of 6 random Pokémon stats × 100 trials).
- Commit: `task 23: add DefensiveSummary and TeamStatRadar`.
- **Acceptance:** a team heavy in speed shows a radar skewed toward the Speed axis.

### Task 24: Implement team share via URL encoding

- `lib/pokemon/team-code.ts`: `encodeTeam(ids: number[]): string` returns dash-joined padded IDs like `006-009-003-065-143-094`. `decodeTeam(code: string): number[]` parses back.
- Add "Share Team" button to `TeamBuilder`. On click, navigate to `/team/{code}`.
- Build `app/team/[code]/page.tsx` as a read-only server component that decodes the code, fetches the 6 Pokémon, and renders the coverage matrix + summary + radar.
- Include "Copy Link" button and "Remix This Team" button (loads the team into `/team`).
- Commit: `task 24: add URL-encoded team sharing`.
- **Acceptance:** building a team, clicking share, copying the URL, opening in incognito renders the same team with the same analysis.

**→ Open PR: `feature/team-coverage` → `develop`.** Title: `feature: team coverage analysis + sharing`. Merge with merge commit.

**Checkpoint, MVP complete.** Three signature features are done (dex, detail, team). If you stop here, it's a strong portfolio piece.

---

## Branch G — `feature/ml-lab` (Tasks 25–30)

**Goal:** `/lab` is the headline feature, a compelling, functioning ML mini-portfolio.

**Branch off:** `develop` (after Branch F merged)

### Task 25: Build `ModelCard` wrapper and `/lab` page structure

- `/lab` is a long scrollable page, one section per model, each wrapped in a `ModelCard`.
- `ModelCard` takes: title, one-sentence description, target metric, and children (the charts).
- Top-of-page intro explains the premise: "Two models trained on Gen 1–3 Pokémon. Here's what they learned."
- Commit: `task 25: scaffold /lab page structure`.
- **Acceptance:** `/lab` renders two empty `ModelCard` sections ("BST Regressor" and "Legendary Classifier") with headers and descriptions.

### Task 26: Build `FeatureImportanceChart`

- Horizontal bar chart showing feature importances from `data/model-stats.json`.
- Styled as pixel-art bars: 10 discrete segments per bar, stepped animation on scroll-into-view.
- Features labeled in IBM Plex Mono, values as percentages.
- Commit: `task 26: add FeatureImportanceChart`.
- **Acceptance:** rendered for both models; BST regressor shows `is_legendary` and `weight_hg` as top features; classifier shows `base_stat_total` and `speed` as top features.

### Task 27: Build `ConfusionMatrix` component

- 2×2 grid for the legendary classifier: TP, FP, FN, TN with counts and percentages.
- Color-coded: greens for correct predictions, reds for errors.
- Below the matrix, precision/recall/F1 in IBM Plex Mono.
- Explainer text: call out that the class imbalance (15 legendaries / 386) makes recall the interesting metric.
- Commit: `task 27: add ConfusionMatrix`.
- **Acceptance:** values match those in `data/model-stats.json`.

### Task 28: Build `ResidualPlot` and `LearningCurve`

- `ResidualPlot`: scatter plot of predicted BST vs. actual BST for the regressor. Overshoots above y=x line, undershoots below.
- `LearningCurve`: train vs. val score over increasing training set size (requires `train-models.py` to emit this data, circle back and update it if needed; commit the updated script in the same task).
- Both use recharts, styled with CRT scanline overlays.
- Commit: `task 28: add ResidualPlot and LearningCurve`.
- **Acceptance:** residual plot shows a roughly linear trend; learning curves converge.

### Task 29: Build `/lab/predict` interactive form

- 6 stat sliders (range 1-255), each showing current value in IBM Plex Mono.
- "Predict" button POSTs to `/api/predict`.
- Results display: predicted BST (large number), predicted legendary probability (0-100% gauge styled as a pixel bar), and "Closest real Pokémon" computed client-side via nearest-neighbor in stat-space (full dataset is already loaded for the `/compare` feature).
- Submission logged via server action to `predictions_log`.
- Commit: `task 29: add /lab/predict interactive form`.
- **Acceptance:** adjusting sliders to Mewtwo's stats (106/110/90/154/90/130) yields a legendary probability >0.8 and a BST prediction within 10% of 680.

### Task 30: Write `/lab` copy

- Intro paragraph explaining the project's ML angle.
- One paragraph per model explaining *what* it predicts and *why* that's interesting.
- A closing note linking to `github.com/jleo28/pokedex-plus` for the training code.
- Write in your voice, first person, specific, grounded. No "passionate about machine learning" filler.
- Commit: `task 30: write /lab copy`.
- **Acceptance:** copy reads naturally; no generic phrases; someone who doesn't know ML can skim and understand what was built.

**→ Open PR: `feature/ml-lab` → `develop`.** Title: `feature: ML lab page`. Merge with merge commit.

**Checkpoint, headline feature done.** If you ship now, recruiters see the ML story. Post-MVP features from here are nice-to-haves.

---

## Branch H — `feature/compare-submit` (Tasks 31–34)

**Goal:** `/compare` side-by-side, "Add a Pokémon" feature, fill in RelatedPokemon on detail.

**Branch off:** `develop` (after Branch G merged)

### Task 31: Build `/compare` page

- Two Pokémon pickers side-by-side, URL-synced (`?a=6&b=150`).
- Below the pickers: side-by-side stat comparison (StatBar for each of the 6 stats, with deltas shown in small text).
- Type effectiveness comparison: who wins in a type matchup?
- Commit: `task 31: add /compare page`.
- **Acceptance:** `/compare?a=6&b=150` shows Charizard vs Mewtwo with stat deltas; Mewtwo wins most stats.

### Task 32: Add "Submit Your Pokémon" form

- A form (modal or dedicated page `/submit`) with name input, 2 type selectors, 6 stat inputs.
- On submit: server action calls `/api/predict` with the stats, saves to `user_submissions` with the prediction attached, returns result to user.
- Success state shows: "Your Mewthreetwo has a predicted BST of 702 and is 94% likely to be legendary."
- Commit: `task 32: add submit-a-Pokémon form`.
- **Acceptance:** submitting the form persists to Supabase and shows a prediction.

### Task 33: Build "Recent Submissions" gallery

- On `/submit` page, below the form, show recent user submissions (most recent 20).
- Each displays: fake sprite placeholder (or a random sprite from the dex), name, types, stats, predicted BST and legendary probability.
- Simple, low-stakes, this is a "community" feature for fun.
- Commit: `task 33: add recent submissions gallery`.
- **Acceptance:** submissions appear after a page refresh.

### Task 34: Build `RelatedPokemon` for detail page

- Fill in the placeholder from Task 18.
- Computes nearest-neighbor in stat-space (Euclidean distance on the 6 base stats, normalized).
- Displays 3 most similar Pokémon as small cards.
- Commit: `task 34: implement RelatedPokemon on detail page`.
- **Acceptance:** on `/pokedex/charizard`, the related section shows 3 Pokémon with similar stat distributions.

**→ Open PR: `feature/compare-submit` → `develop`.** Title: `feature: compare + submit + related`. Merge with merge commit.

---

## Branch I — `feature/signature-polish` (Tasks 35–39)

**Goal:** the three signature moments from DESIGN §10 land. Small joyful details added.

**Branch off:** `develop` (after Branch H merged)

### Task 35: Implement Day/Night theme toggle

- Button in top nav. Clicking cycles Day ↔ Night.
- Persist to `localStorage`.
- Respect `prefers-color-scheme` on first visit.
- Night mode's palette collapse (all accents → DMG green) is the signature, verify the site looks *different* in Night mode, not just "dark."
- Commit: `task 35: add Day/Night theme toggle`.
- **Acceptance:** toggling swaps the entire palette; the whole app looks monochrome green in Night mode; reloading preserves the choice.

### Task 36: Implement sound system + cry button

- `components/layout/SoundToggle.tsx`: global mute toggle in top nav, persists to localStorage, defaults OFF.
- `lib/sound/beep.ts`: Web Audio API generator for UI beeps (short 600Hz square wave, ~50ms).
- Wire beep into `Button.tsx` onClick (only fires if sound is enabled).
- Upgrade the stub `CryButton` from Task 18 to respect the global mute.
- Add confirm chime for team save / submission actions.
- Commit: `task 36: add sound system and global mute`.
- **Acceptance:** sound is off by default; toggling enables all sound; cry button works on a detail page.

### Task 37: Implement CRT overlay (toggleable)

- `components/layout/CRTOverlay.tsx`: fixed-position pseudo-element with scanlines and vignette per DESIGN §5.
- Toggle in a "Settings" menu (small gear icon in top nav, opens dropdown).
- Persist to localStorage, default OFF.
- Flicker as a sub-toggle, also default OFF.
- Auto-disable on mobile (via `pointer: coarse` media query).
- Commit: `task 37: add CRT overlay with flicker sub-toggle`.
- **Acceptance:** toggling CRT adds a visible scanline pattern without affecting interaction.

### Task 38: Page transitions

- Implement a screen-wipe transition between routes using the Next.js `template.tsx` pattern with CSS animation.
- 350ms, `--ease-snap`.
- Respects `prefers-reduced-motion` (crossfade instead).
- Commit: `task 38: add route transitions`.
- **Acceptance:** navigating between `/pokedex` and `/team` shows a wipe effect, not a hard cut.

### Task 39: Landing page polish

- Replace the minimal Task 6 landing with something real.
- Hero: "Pokédex++" in Press Start 2P, tagline, CTA buttons for `/pokedex`, `/team`, `/lab`.
- A "Featured" carousel showing 3-5 random Pokémon.
- A one-paragraph intro ("This is a rebuild of my 2023 ITP-216 final project. It's a Pokédex. It also has two sklearn models doing real predictions. Built with Next.js and Supabase.").
- Link to `jleo.me` and `github.com/jleo28/pokedex-plus` in footer.
- Commit: `task 39: polish landing page`.
- **Acceptance:** landing page reads as the front door of a substantial project; Lighthouse scores remain >90 on all axes.

**→ Open PR: `feature/signature-polish` → `develop`.** Title: `feature: polish (theme, sound, CRT, transitions, landing)`. Merge with merge commit.

---

## Branch J — `feature/launch-hygiene` (Tasks 40–41)

**Goal:** repo is launch-ready.

**Branch off:** `develop` (after Branch I merged)

### Task 40: README and repo hygiene

- Write a real README with: what this is, live URL, tech stack, screenshots, local dev setup, credits to PokeAPI, acknowledgement that the original version was a 2023 Flask project for ITP-216.
- Add `LICENSE` (MIT).
- Clean up any dev-only debug code, remove `console.log` statements, delete any `/preview` or scratch routes.
- Run `npm run build` locally, fix any warnings.
- Commit: `task 40: write README and clean up`.
- **Acceptance:** fresh clone + `npm install` + env setup + `npm run dev` works end to end from the README alone.

### Task 41: Meta tags, OG image, sitemap

- `app/layout.tsx`: comprehensive metadata (title, description, OG image, Twitter card).
- Design an OG image: Pokédex++ logo + a cluster of sprites on a retro background. 1200×630. Store in `public/og.png`.
- Add `app/sitemap.ts` and `app/robots.ts`.
- Commit: `task 41: add meta tags, OG image, sitemap`.
- **Acceptance:** sharing the URL on Twitter/LinkedIn shows a custom preview card; `/sitemap.xml` exists.

**→ Open PR: `feature/launch-hygiene` → `develop`.** Title: `feature: launch hygiene`. Merge with merge commit.

---

## Branch L — `release/1.0`

**Goal:** promote `develop` to `main`, triggering production deploy.

**Branch off:** `develop` (after Branch J merged)

- Create `release/1.0` branch from `develop`. No code changes; this is the ceremony branch.
- Verify against the final checklist below.
- **→ Open PR: `release/1.0` → `main`.** Title: `release: 1.0`. PR description summarizes the project and lists the checklist results. Merge with merge commit.
- **Also merge `main` back into `develop`** to keep branches in sync for future work.
- Tag the merge commit: `git tag v1.0 && git push --tags`.

### Final checklist (paste into the release PR description)

- [ ] All 41 task commits present in `develop` history.
- [ ] `npm run build` passes with no warnings.
- [ ] Lighthouse: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90 on landing, /pokedex, /team, /lab.
- [ ] Keyboard-only navigation works through the full app (especially team builder).
- [ ] Mobile (Chrome dev tools iPhone 14 Pro) renders correctly, no horizontal scroll, CRT disabled, chunky borders scaled.
- [ ] Night mode renders the full palette swap, visually distinct from Day, not just darker.
- [ ] `/api/predict` responds in <2s on a cold start.
- [ ] A recruiter clicking `pokedexpp.vercel.app` from a LinkedIn link sees something loading fast, looking intentional, and working on their phone.

---

## Task 42, Integrate into jleo.me (happens in the About-Me repo)

This is not part of the pokedex-plus repo or its gitflow. Do this in the About-Me repo using its existing gitflow (`main` → `develop` → `feature/*`).

In the About-Me repo (`C:\Dev\personal-site\`):

1. Branch from `develop`: `git checkout -b feature/link-pokedex-plus`.
2. Update `lib/data.ts`, modify the existing Pokédex++ entry in `projects`:
   - New description referencing the rebuild
   - Link to `pokedexpp.vercel.app` as the live URL
   - Update the GitHub URL to `github.com/jleo28/pokedex-plus`
3. Commit: `link rebuilt Pokédex++ to portfolio`.
4. Open PR: `feature/link-pokedex-plus` → `develop`. Merge.
5. Once verified on Vercel preview, open PR: `develop` → `main`. Merge to deploy to jleo.me.

---

## Appendix: Explicit Dependency Graph

Branch-level dependencies (within a branch, tasks are sequential):

- A blocks everything
- B blocks S1, C
- S1 blocks G (need working `/api/predict` before building `/lab/predict` UI against it)
- C blocks D
- D blocks E (picker reuses PokedexCard compact variant from D's detail work; also D proves the detail layout pattern)
- E blocks S2, F
- S2 blocks F (team builder reorder must work before coverage analysis is useful)
- F blocks G (conceptually, ship the MVP before the headline feature, so you always have a demoable state if you run out of time)
- G blocks H (Task 34's RelatedPokemon reuses patterns from H's /compare)
- H blocks I
- I blocks J
- J blocks L

## Appendix: What to Cut if Time Runs Short

Ordered from first-to-cut to last. Cuts drop whole branches or tasks:

1. **Drop Branch I entirely** (Tasks 35-39 sound/CRT/transitions/landing polish), ship the site with just the design system. Biggest cut, saves ~1 week. The Day/Night toggle is the most impactful single loss; consider moving ONLY that task into a slimmer `feature/theme-toggle` branch if you cut Branch I.
2. **Drop Branch H** (Tasks 31-34 compare/submit/related), lose three routes but core product intact. Saves ~4 days.
3. **Drop Task 38** (page transitions), small polish. Saves ~2 hours.
4. **Drop Task 37** (CRT overlay), polish. Saves ~4 hours.
5. **Drop Task 36** (sound), polish. Saves ~6 hours.

**DO NOT CUT:** Branches A, B, C, D, E, F, G. These are the product.
