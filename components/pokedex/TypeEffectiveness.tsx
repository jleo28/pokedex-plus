import { getDefensiveMatchup } from '@/lib/pokemon/typeChart';
import { TypeBadge } from './TypeBadge';
import type { PokemonType } from '@/lib/pokemon/types';
import styles from './TypeEffectiveness.module.css';

interface TypeEffectivenessProps {
  type1: PokemonType;
  type2?: PokemonType | null;
}

export function TypeEffectiveness({ type1, type2 }: TypeEffectivenessProps) {
  const matchup = getDefensiveMatchup(type1, type2);

  const rows: { label: string; types: PokemonType[]; mod: string }[] = [
    { label: '4×', types: matchup.quad,    mod: styles.quad },
    { label: '2×', types: matchup.double,  mod: styles.double },
    { label: '½',  types: matchup.half,    mod: styles.half },
    { label: '¼',  types: matchup.quarter, mod: styles.quarter },
    { label: '0×', types: matchup.immune,  mod: styles.immune },
  ].filter((r) => r.types.length > 0);

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Type matchups</h2>
      <div className={styles.rows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <span className={`${styles.mult} ${row.mod}`}>{row.label}</span>
            <div className={styles.badges}>
              {row.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
