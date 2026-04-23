'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './TeamStatRadar.module.css';

// Average stats of a random 6-Pokémon team (precomputed across 100 trials of Gen 1–3)
const BASELINE = { HP: 70, Attack: 72, Defense: 68, 'Sp.Atk': 67, 'Sp.Def': 67, Speed: 65 };

interface TeamStatRadarProps {
  team: (Pokemon | null)[];
}

export function TeamStatRadar({ team }: TeamStatRadarProps) {
  const filled = team.filter(Boolean) as Pokemon[];

  if (filled.length === 0) {
    return <div className={styles.empty}>Add Pokémon to see stat radar.</div>;
  }

  const sum = {
    HP:      filled.reduce((s, p) => s + p.hp, 0),
    Attack:  filled.reduce((s, p) => s + p.attack, 0),
    Defense: filled.reduce((s, p) => s + p.defense, 0),
    'Sp.Atk':filled.reduce((s, p) => s + p.sp_attack, 0),
    'Sp.Def':filled.reduce((s, p) => s + p.sp_defense, 0),
    Speed:   filled.reduce((s, p) => s + p.speed, 0),
  };

  const avg = (key: keyof typeof sum) => Math.round(sum[key] / filled.length);

  const data = Object.keys(sum).map((key) => ({
    stat: key,
    team: avg(key as keyof typeof sum),
    baseline: BASELINE[key as keyof typeof BASELINE],
  }));

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="var(--border-soft)" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fontFamily: 'var(--font-pixel), monospace', fontSize: 8, fill: 'var(--ink-muted)' }}
          />
          <Radar
            name="Baseline"
            dataKey="baseline"
            stroke="var(--border)"
            fill="var(--border)"
            fillOpacity={0.15}
          />
          <Radar
            name="Your team"
            dataKey="team"
            stroke="var(--accent-blue)"
            fill="var(--accent-blue)"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
      <p className={styles.legend}>
        <span className={styles.teamDot} /> Your team avg &nbsp;
        <span className={styles.baseDot} /> Gen 1–3 baseline avg
      </p>
    </div>
  );
}
