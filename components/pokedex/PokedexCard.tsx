'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Pokemon } from '@/lib/pokemon/types';
import { TypeBadge } from './TypeBadge';
import { SpriteImage } from './SpriteImage';
import { StatBar } from './StatBar';
import styles from './PokedexCard.module.css';

interface PokedexCardProps {
  pokemon: Pokemon;
}

export function PokedexCard({ pokemon }: PokedexCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dexNumber = `#${String(pokemon.id).padStart(3, '0')}`;

  return (
    <Link
      ref={ref}
      href={`/pokedex/${pokemon.slug}`}
      className={`${styles.card}${visible ? ` ${styles.visible}` : ''}`}
    >
      <div className={styles.inner}>
        <div className={styles.sprite}>
          <SpriteImage src={pokemon.sprite_url} name={pokemon.name} size={80} />
        </div>
        <div className={styles.info}>
          <div className={styles.dexNumber}>{dexNumber}</div>
          <div className={styles.name}>{pokemon.name}</div>
          <div className={styles.types}>
            <TypeBadge type={pokemon.type_primary} />
            {pokemon.type_secondary && <TypeBadge type={pokemon.type_secondary} />}
          </div>
        </div>
      </div>
      <div className={styles.statRow}>
        <StatBar label="HP" value={pokemon.hp} color="var(--success)" />
      </div>
    </Link>
  );
}
