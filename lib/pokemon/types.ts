export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface Pokemon {
  id: number;
  slug: string;
  name: string;
  generation: number;
  type_primary: PokemonType;
  type_secondary: PokemonType | null;
  hp: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
  base_stat_total: number;
  height_dm: number | null;
  weight_hg: number | null;
  is_legendary: boolean;
  sprite_url: string;
  cry_url: string | null;
}

export interface Evolution {
  id: number;
  from_id: number;
  to_id: number;
  trigger: string;
  trigger_value: string | null;
}

export interface PokedexFilters {
  gen?: string;
  type?: string;
  legendary?: string;
  q?: string;
}
