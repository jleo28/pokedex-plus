'use client';

import { useMemo } from 'react';
import { ALL_TYPES, getDefensiveMatchup } from '@/lib/pokemon/typeChart';
import type { Pokemon } from '@/lib/pokemon/types';
import type { PokemonType } from '@/lib/pokemon/types';
import styles from './DefensiveSummary.module.css';

interface DefensiveSummaryProps {
  team: (Pokemon | null)[];
}

interface TypeRow {
  type: PokemonType;
  weak: number;
  resist: number;
  immune: number;
}

export function DefensiveSummary({ team }: DefensiveSummaryProps) {
  const filled = team.filter(Boolean) as Pokemon[];

  const rows = useMemo<TypeRow[]>(() => {
    return ALL_TYPES.map((atkType) => {
      let weak = 0, resist = 0, immune = 0;
      for (const p of filled) {
        const matchup = getDefensiveMatchup(p.type_primary, p.type_secondary);
        if (matchup.immune.includes(atkType)) immune++;
        else if (matchup.quad.includes(atkType) || matchup.double.includes(atkType)) weak++;
        else if (matchup.half.includes(atkType) || matchup.quarter.includes(atkType)) resist++;
      }
      return { type: atkType, weak, resist, immune };
    }).sort((a, b) => b.weak - a.weak || a.resist - b.resist);
  }, [filled]);

  if (filled.length === 0) {
    return (
      <div className={styles.empty}>Add Pokémon to see defensive summary.</div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {rows.map((row) => (
        <div key={row.type} className={styles.row}>
          <span className={styles.type}>{row.type}</span>
          <div className={styles.bars}>
            {row.weak > 0 && (
              <span className={`${styles.tag} ${styles.weak}`}>
                {row.weak} weak
              </span>
            )}
            {row.resist > 0 && (
              <span className={`${styles.tag} ${styles.resist}`}>
                {row.resist} resist
              </span>
            )}
            {row.immune > 0 && (
              <span className={`${styles.tag} ${styles.immune}`}>
                {row.immune} immune
              </span>
            )}
            {row.weak === 0 && row.resist === 0 && row.immune === 0 && (
              <span className={styles.neutral}>all neutral</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
