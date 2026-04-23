import type { PokemonType } from './types';

// Defensive multipliers: CHART[defending_type][attacking_type] = multiplier
// Missing entries = 1 (normal effectiveness)
const CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal:   { fighting: 2, ghost: 0 },
  fire:     { fire: 0.5, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5, water: 2, ground: 2, rock: 2 },
  water:    { fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5, electric: 2, grass: 2 },
  electric: { electric: 0.5, flying: 0.5, steel: 0.5, ground: 2 },
  grass:    { water: 0.5, electric: 0.5, grass: 0.5, ground: 0.5, fire: 2, ice: 2, poison: 2, flying: 2, bug: 2 },
  ice:      { ice: 0.5, fire: 2, fighting: 2, rock: 2, steel: 2 },
  fighting: { bug: 0.5, rock: 0.5, dark: 0.5, flying: 2, psychic: 2, fairy: 2 },
  poison:   { grass: 0.5, fighting: 0.5, poison: 0.5, bug: 0.5, fairy: 0.5, ground: 2, psychic: 2 },
  ground:   { poison: 0.5, rock: 0.5, electric: 0, water: 2, grass: 2, ice: 2 },
  flying:   { ground: 0, grass: 0.5, fighting: 0.5, bug: 0.5, electric: 2, ice: 2, rock: 2 },
  psychic:  { fighting: 0.5, psychic: 0.5, bug: 2, ghost: 2, dark: 2 },
  bug:      { grass: 0.5, fighting: 0.5, ground: 0.5, fire: 2, flying: 2, rock: 2 },
  rock:     { normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5, water: 2, grass: 2, fighting: 2, ground: 2, steel: 2 },
  ghost:    { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 2 },
  dragon:   { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, dragon: 2, fairy: 2 },
  dark:     { psychic: 0, ghost: 0.5, dark: 0.5, fighting: 2, bug: 2, fairy: 2 },
  steel:    { poison: 0, normal: 0.5, grass: 0.5, ice: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, fire: 2, fighting: 2, ground: 2 },
  fairy:    { dragon: 0, fighting: 0.5, bug: 0.5, dark: 0.5, poison: 2, steel: 2 },
};

export const ALL_TYPES: PokemonType[] = [
  'normal','fire','water','electric','grass','ice','fighting','poison',
  'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy',
];

export interface TypeMatchup {
  immune: PokemonType[];
  quarter: PokemonType[];
  half: PokemonType[];
  double: PokemonType[];
  quad: PokemonType[];
}

// How effective is [attackingType] against [defendingType]
export function getOffensiveMultiplier(atk: PokemonType, def: PokemonType): number {
  return CHART[def][atk] ?? 1;
}

export function getDefensiveMatchup(t1: PokemonType, t2?: PokemonType | null): TypeMatchup {
  const result: TypeMatchup = { immune: [], quarter: [], half: [], double: [], quad: [] };

  for (const atk of ALL_TYPES) {
    const m1 = CHART[t1][atk] ?? 1;
    const m2 = t2 ? (CHART[t2][atk] ?? 1) : 1;
    const total = m1 * m2;
    if (total === 0)    result.immune.push(atk);
    else if (total === 0.25) result.quarter.push(atk);
    else if (total === 0.5)  result.half.push(atk);
    else if (total === 2)    result.double.push(atk);
    else if (total === 4)    result.quad.push(atk);
  }

  return result;
}
