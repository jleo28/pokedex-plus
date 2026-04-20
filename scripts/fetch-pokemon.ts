/**
 * Fetches Gen 1-3 Pokémon data (IDs 1-386) from PokeAPI and writes data/pokemon.json.
 * Run once at setup: npx tsx scripts/fetch-pokemon.ts
 */

import fs from 'fs';
import path from 'path';

const TOTAL = 386;
const RATE_LIMIT_MS = 100; // 10 req/sec
const MAX_RETRIES = 3;

interface PokemonRecord {
  id: number;
  slug: string;
  name: string;
  generation: number;
  type_primary: string;
  type_secondary: string | null;
  hp: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
  height_dm: number;
  weight_hg: number;
  is_legendary: boolean;
  sprite_url: string;
  cry_url: string | null;
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 429) {
        await sleep(2000 * (i + 1));
        continue;
      }
      throw new Error(`HTTP ${res.status} for ${url}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(500 * (i + 1));
    }
  }
  throw new Error(`Failed after ${retries} retries: ${url}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function idToGeneration(id: number): number {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  return 3;
}

async function fetchPokemon(id: number): Promise<PokemonRecord> {
  const [pokeRes, speciesRes] = await Promise.all([
    fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);

  const poke = await pokeRes.json();
  const species = await speciesRes.json();

  const types: string[] = poke.types
    .sort((a: any, b: any) => a.slot - b.slot)
    .map((t: any) => t.type.name as string);

  const stats: Record<string, number> = {};
  for (const s of poke.stats) {
    stats[s.stat.name] = s.base_stat;
  }

  const sprite =
    poke.sprites?.versions?.['generation-iii']?.emerald?.front_default ??
    poke.sprites?.front_default ??
    null;

  const cry = poke.cries?.legacy ?? null;

  return {
    id,
    slug: poke.name as string,
    name: species.names.find((n: any) => n.language.name === 'en')?.name ?? poke.name,
    generation: idToGeneration(id),
    type_primary: types[0],
    type_secondary: types[1] ?? null,
    hp: stats['hp'],
    attack: stats['attack'],
    defense: stats['defense'],
    sp_attack: stats['special-attack'],
    sp_defense: stats['special-defense'],
    speed: stats['speed'],
    height_dm: poke.height,
    weight_hg: poke.weight,
    is_legendary: species.is_legendary || species.is_mythical,
    sprite_url: sprite,
    cry_url: cry,
  };
}

async function main() {
  const results: PokemonRecord[] = [];
  const failed: number[] = [];

  console.log(`Fetching ${TOTAL} Pokémon from PokeAPI...`);

  for (let id = 1; id <= TOTAL; id++) {
    try {
      const record = await fetchPokemon(id);
      results.push(record);
      if (id % 20 === 0 || id === TOTAL) {
        process.stdout.write(`\r  ${id}/${TOTAL} fetched`);
      }
    } catch (err) {
      console.error(`\n  ERROR id=${id}:`, err);
      failed.push(id);
    }
    await sleep(RATE_LIMIT_MS);
  }

  console.log(`\n\nFetched: ${results.length}, Failed: ${failed.length}`);
  if (failed.length) console.log('Failed IDs:', failed);

  results.sort((a, b) => a.id - b.id);

  const outPath = path.join(process.cwd(), 'data', 'pokemon.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Written to ${outPath}`);

  // Spot-check
  const charizard = results.find((p) => p.id === 6);
  if (charizard) {
    console.log('\nSpot-check Charizard (#6):');
    console.log(`  type_primary: ${charizard.type_primary} (expect fire)`);
    console.log(`  type_secondary: ${charizard.type_secondary} (expect flying)`);
    console.log(`  sprite_url: ${charizard.sprite_url ? 'present' : 'MISSING'}`);
  }
}

main().catch(console.error);
