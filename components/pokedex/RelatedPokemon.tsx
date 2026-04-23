import Link from 'next/link';
import { SpriteImage } from './SpriteImage';
import { TypeBadge } from './TypeBadge';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './RelatedPokemon.module.css';

interface RelatedPokemonProps {
  current: Pokemon;
  all: Pokemon[];
}

function euclidean(a: Pokemon, b: Pokemon): number {
  const stats: (keyof Pokemon)[] = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
  const maxes = [255, 190, 230, 194, 230, 180];
  return Math.sqrt(
    stats.reduce((sum, key, i) => {
      const diff = ((a[key] as number) - (b[key] as number)) / maxes[i];
      return sum + diff * diff;
    }, 0),
  );
}

export function RelatedPokemon({ current, all }: RelatedPokemonProps) {
  const related = all
    .filter((p) => p.id !== current.id)
    .map((p) => ({ pokemon: p, dist: euclidean(current, p) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map((r) => r.pokemon);

  return (
    <div className={styles.grid}>
      {related.map((p) => (
        <Link key={p.id} href={`/pokedex/${p.slug}`} className={styles.card}>
          <SpriteImage src={p.sprite_url} name={p.name} size={64} />
          <span className={styles.name}>{p.name}</span>
          <div className={styles.types}>
            <TypeBadge type={p.type_primary} />
            {p.type_secondary && <TypeBadge type={p.type_secondary} />}
          </div>
        </Link>
      ))}
    </div>
  );
}
