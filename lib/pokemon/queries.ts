// Pokédex data is a fixed set of 386 Pokémon, so it ships with the app as
// static JSON instead of living in a database. Exported from the original
// Supabase tables (checksum-verified identical) in Oct 2026.
import pokemonData from '@/data/static/pokemon.json';
import evolutionData from '@/data/static/evolutions.json';
import type { Pokemon, Evolution, PokedexFilters } from './types';

const ALL: Pokemon[] = (pokemonData as Pokemon[]).slice().sort((a, b) => a.id - b.id);
const EVOLUTIONS: Evolution[] = evolutionData as Evolution[];
const BY_ID = new Map(ALL.map((p) => [p.id, p]));
const BY_SLUG = new Map(ALL.map((p) => [p.slug, p]));

export async function getAllPokemon(filters: PokedexFilters = {}): Promise<Pokemon[]> {
  const gen = filters.gen && filters.gen !== 'all' ? parseInt(filters.gen, 10) : null;
  const type = filters.type && filters.type !== 'all' ? filters.type : null;
  const q = filters.q?.trim().toLowerCase() || null;

  return ALL.filter((p) => {
    if (gen !== null && p.generation !== gen) return false;
    if (type && p.type_primary !== type && p.type_secondary !== type) return false;
    if (filters.legendary === 'yes' && !p.is_legendary) return false;
    if (filters.legendary === 'no' && p.is_legendary) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

export async function getPokemonBySlug(slug: string): Promise<Pokemon | null> {
  return BY_SLUG.get(slug) ?? null;
}

export async function getPokemonByIds(ids: number[]): Promise<Pokemon[]> {
  return ids.map((id) => BY_ID.get(id)).filter((p): p is Pokemon => Boolean(p));
}

export async function getEvolutionChain(
  pokemonId: number,
): Promise<{ evolutions: Evolution[]; chain: number[] }> {
  let rootId = pokemonId;
  const seen = new Set<number>();
  for (;;) {
    const parent = EVOLUTIONS.find((e) => e.to_id === rootId);
    if (!parent || seen.has(parent.from_id)) break;
    seen.add(rootId);
    rootId = parent.from_id;
  }

  const evolutions: Evolution[] = [];
  const chain: number[] = [rootId];
  const visited = new Set([rootId]);
  let frontier = [rootId];
  while (frontier.length > 0) {
    const next: number[] = [];
    for (const id of frontier) {
      for (const evo of EVOLUTIONS.filter((e) => e.from_id === id)) {
        evolutions.push(evo);
        if (!visited.has(evo.to_id)) {
          visited.add(evo.to_id);
          chain.push(evo.to_id);
          next.push(evo.to_id);
        }
      }
    }
    frontier = next;
  }

  return { evolutions, chain };
}
