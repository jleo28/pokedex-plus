'use client';

import { useMemo } from 'react';
import { ALL_TYPES, getOffensiveMultiplier } from '@/lib/pokemon/typeChart';
import type { Pokemon } from '@/lib/pokemon/types';
import type { PokemonType } from '@/lib/pokemon/types';
import styles from './TypeCoverageMatrix.module.css';

interface TypeCoverageMatrixProps {
  team: (Pokemon | null)[];
}

function multLabel(m: number): string {
  if (m === 0) return '0';
  if (m === 0.25) return '¼';
  if (m === 0.5) return '½';
  if (m === 2) return '2';
  if (m === 4) return '4';
  return '1';
}

function multClass(m: number): string {
  if (m === 0) return styles.immune;
  if (m < 1)   return styles.resisted;
  if (m === 1)  return styles.neutral;
  if (m === 2)  return styles.super;
  return styles.quad;
}

export function TypeCoverageMatrix({ team }: TypeCoverageMatrixProps) {
  const atkTypes = useMemo(() => {
    const seen = new Set<PokemonType>();
    for (const p of team) {
      if (!p) continue;
      seen.add(p.type_primary);
      if (p.type_secondary) seen.add(p.type_secondary);
    }
    return ALL_TYPES.filter((t) => seen.has(t));
  }, [team]);

  if (atkTypes.length === 0) {
    return (
      <div className={styles.empty}>
        Add Pokémon to see type coverage.
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.corner}>ATK ↓ / DEF →</th>
              {ALL_TYPES.map((def) => (
                <th key={def} className={styles.colHead}>
                  <span className={styles.rotated}>{def}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {atkTypes.map((atk) => (
              <tr key={atk}>
                <td className={styles.rowHead}>{atk}</td>
                {ALL_TYPES.map((def) => {
                  const m = getOffensiveMultiplier(atk, def);
                  return (
                    <td key={def} className={`${styles.cell} ${multClass(m)}`}>
                      {m !== 1 ? multLabel(m) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
