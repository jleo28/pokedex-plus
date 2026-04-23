import { createServerClient } from '@/lib/supabase/server';
import type { Pokemon, Evolution, PokedexFilters } from './types';

export async function getAllPokemon(filters: PokedexFilters = {}): Promise<Pokemon[]> {
  const supabase = createServerClient();
  let query = supabase
    .from('pokemon')
    .select('*')
    .order('id', { ascending: true });

  if (filters.gen && filters.gen !== 'all') {
    query = query.eq('generation', parseInt(filters.gen));
  }
  if (filters.type && filters.type !== 'all') {
    query = query.or(`type_primary.eq.${filters.type},type_secondary.eq.${filters.type}`);
  }
  if (filters.legendary === 'yes') {
    query = query.eq('is_legendary', true);
  } else if (filters.legendary === 'no') {
    query = query.eq('is_legendary', false);
  }
  if (filters.q) {
    query = query.ilike('name', `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`getAllPokemon: ${error.message}`);
  return (data ?? []) as Pokemon[];
}

export async function getPokemonBySlug(slug: string): Promise<Pokemon | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('pokemon')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Pokemon;
}

export async function getPokemonByIds(ids: number[]): Promise<Pokemon[]> {
  if (ids.length === 0) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('pokemon')
    .select('*')
    .in('id', ids);

  if (error) throw new Error(`getPokemonByIds: ${error.message}`);
  return (data ?? []) as Pokemon[];
}

export async function getEvolutionChain(
  pokemonId: number,
): Promise<{ evolutions: Evolution[]; chain: number[] }> {
  const supabase = createServerClient();

  async function findRoot(id: number): Promise<number> {
    const { data } = await supabase
      .from('evolutions')
      .select('from_id')
      .eq('to_id', id)
      .single();
    if (data) return findRoot((data as { from_id: number }).from_id);
    return id;
  }

  async function collectChain(rootId: number): Promise<Evolution[]> {
    const { data } = await supabase
      .from('evolutions')
      .select('*')
      .eq('from_id', rootId);
    if (!data || data.length === 0) return [];
    const evolutions = data as Evolution[];
    const next = await Promise.all(evolutions.map((e) => collectChain(e.to_id)));
    return [...evolutions, ...next.flat()];
  }

  const rootId = await findRoot(pokemonId);
  const evolutions = await collectChain(rootId);

  // Build ordered chain of unique IDs (BFS from root)
  const chain: number[] = [rootId];
  const visited = new Set([rootId]);
  let frontier = [rootId];
  while (frontier.length > 0) {
    const next: number[] = [];
    for (const id of frontier) {
      for (const evo of evolutions.filter((e) => e.from_id === id)) {
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
