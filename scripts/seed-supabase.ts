/**
 * Seeds Supabase with Pokémon data and evolution chains.
 * Run once at setup: npx tsx scripts/seed-supabase.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase/types';

// Load env manually (no dotenv dep needed in Node 20+)
const envPath = path.join(process.cwd(), '.env.local');
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim()) as [string, string])
);

const supabase = createClient<Database>(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY'],
  { auth: { persistSession: false } }
);

function padId(id: number): string {
  return String(id).padStart(3, '0');
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
      if (res.status === 429) { await sleep(2000 * (i + 1)); continue; }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(500 * (i + 1));
    }
  }
}

// ─── Part 1: Seed pokemon table ──────────────────────────────────────────────

async function seedPokemon() {
  const raw: any[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'pokemon.json'), 'utf-8')
  );

  const rows = raw.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    generation: p.generation,
    type_primary: p.type_primary,
    type_secondary: p.type_secondary ?? null,
    hp: p.hp,
    attack: p.attack,
    defense: p.defense,
    sp_attack: p.sp_attack,
    sp_defense: p.sp_defense,
    speed: p.speed,
    height_dm: p.height_dm ?? null,
    weight_hg: p.weight_hg ?? null,
    is_legendary: p.is_legendary,
    sprite_url: `/sprites/${padId(p.id)}.png`,
    cry_url: `/cries/${padId(p.id)}.ogg`,
  }));

  console.log(`Inserting ${rows.length} Pokémon...`);

  // Upsert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from('pokemon').upsert(batch);
    if (error) throw new Error(`Batch ${i}: ${error.message}`);
    process.stdout.write(`\r  ${Math.min(i + 50, rows.length)}/${rows.length}`);
  }

  const { count } = await supabase.from('pokemon').select('*', { count: 'exact', head: true });
  console.log(`\nPokémon table: ${count} rows`);
}

// ─── Part 2: Seed evolutions table ───────────────────────────────────────────

interface EvolutionRow {
  from_id: number;
  to_id: number;
  trigger: string;
  trigger_value: string | null;
}

function extractEvolutions(chain: any): EvolutionRow[] {
  const rows: EvolutionRow[] = [];

  function walk(node: any) {
    const fromId = extractId(node.species.url);
    for (const next of node.evolves_to ?? []) {
      const toId = extractId(next.species.url);
      const detail = next.evolution_details?.[0];
      const trigger = detail?.trigger?.name ?? 'level-up';
      let triggerValue: string | null = null;

      if (trigger === 'level-up' && detail?.min_level) {
        triggerValue = String(detail.min_level);
      } else if (trigger === 'use-item' && detail?.item?.name) {
        triggerValue = detail.item.name;
      } else if (trigger === 'trade' && detail?.held_item?.name) {
        triggerValue = detail.held_item.name;
      }

      if (fromId <= 386 && toId <= 386) {
        rows.push({ from_id: fromId, to_id: toId, trigger, trigger_value: triggerValue });
      }
      walk(next);
    }
  }

  walk(chain);
  return rows;
}

function extractId(url: string): number {
  const parts = url.replace(/\/$/, '').split('/');
  return parseInt(parts[parts.length - 1], 10);
}

async function seedEvolutions() {
  // Fetch all unique evolution chain URLs for Gen 1-3
  const chainUrls = new Set<string>();
  for (let id = 1; id <= 386; id++) {
    const species = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    if (species.evolution_chain?.url) chainUrls.add(species.evolution_chain.url);
    await sleep(80);
    if (id % 40 === 0) process.stdout.write(`\r  species ${id}/386`);
  }

  console.log(`\nFound ${chainUrls.size} unique evolution chains. Fetching...`);

  const allRows: EvolutionRow[] = [];
  let i = 0;
  for (const url of chainUrls) {
    const data = await fetchWithRetry(url);
    allRows.push(...extractEvolutions(data.chain));
    await sleep(80);
    i++;
    if (i % 20 === 0) process.stdout.write(`\r  chain ${i}/${chainUrls.size}`);
  }

  console.log(`\nInserting ${allRows.length} evolution pairs...`);

  if (allRows.length > 0) {
    const { error } = await supabase.from('evolutions').upsert(allRows, { onConflict: 'from_id,to_id' });
    if (error) throw new Error(`Evolutions insert: ${error.message}`);
  }

  // Acceptance check: Bulbasaur (1) → Ivysaur (2) → Venusaur (3)
  const { count } = await supabase
    .from('evolutions')
    .select('*', { count: 'exact', head: true })
    .eq('from_id', 1);
  console.log(`\nEvolutions from Bulbasaur (expect 1): ${count}`);

  const { count: total } = await supabase.from('evolutions').select('*', { count: 'exact', head: true });
  console.log(`Total evolution rows: ${total}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Seeding Pokémon ===');
  await seedPokemon();

  console.log('\n=== Seeding Evolutions ===');
  await seedEvolutions();

  console.log('\nDone.');
}

main().catch(console.error);
