'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { Input } from '@/components/ui/Input';
import type { PokemonType } from '@/lib/pokemon/types';
import styles from './PokedexFilters.module.css';

const TYPES: PokemonType[] = [
  'normal','fire','water','electric','grass','ice',
  'fighting','poison','ground','flying','psychic','bug',
  'rock','ghost','dragon','dark','steel','fairy',
];

const GENS = [1, 2, 3] as const;

export function PokedexFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeType = searchParams.get('type') ?? '';
  const activeGen = searchParams.get('gen') ?? '';
  const activeLegendary = searchParams.get('legendary') ?? '';
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const push = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/pokedex?${params.toString()}`);
    },
    [router, searchParams],
  );

  function toggle(key: string, value: string, current: string) {
    push(key, current === value ? '' : value);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push('q', val.trim()), 300);
  }

  return (
    <div className={styles.filters}>
      <div className={styles.searchWrapper}>
        <Input
          placeholder="Search Pokémon…"
          value={query}
          onChange={handleSearch}
          aria-label="Search Pokémon"
        />
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Gen</span>
        <div className={styles.chips}>
          <button
            className={`${styles.chip}${activeGen === '' ? ` ${styles.active}` : ''}`}
            onClick={() => push('gen', '')}
          >
            All
          </button>
          {GENS.map((g) => (
            <button
              key={g}
              className={`${styles.chip}${activeGen === String(g) ? ` ${styles.active}` : ''}`}
              onClick={() => toggle('gen', String(g), activeGen)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Type</span>
        <div className={styles.chips}>
          <button
            className={`${styles.chip}${activeType === '' ? ` ${styles.active}` : ''}`}
            onClick={() => push('type', '')}
          >
            All
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              className={`${styles.chip}${activeType === t ? ` ${styles.active}` : ''}`}
              onClick={() => toggle('type', t, activeType)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Legendary</span>
        <div className={styles.chips}>
          {(['', 'yes', 'no'] as const).map((val) => (
            <button
              key={val || 'all'}
              className={`${styles.chip}${activeLegendary === val ? ` ${styles.active}` : ''}`}
              onClick={() => push('legendary', val)}
            >
              {val === '' ? 'All' : val === 'yes' ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
