'use client';

import { SpriteImage } from '@/components/pokedex/SpriteImage';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './TeamSlot.module.css';

interface TeamSlotProps {
  pokemon: Pokemon | null;
  index: number;
  onAdd: (index: number) => void;
  onRemove: (index: number) => void;
}

export function TeamSlot({ pokemon, index, onAdd, onRemove }: TeamSlotProps) {
  if (!pokemon) {
    return (
      <button
        className={styles.empty}
        onClick={() => onAdd(index)}
        aria-label={`Add Pokémon to slot ${index + 1}`}
      >
        <span className={styles.plus}>+</span>
        <span className={styles.addLabel}>Add</span>
      </button>
    );
  }

  return (
    <div className={styles.filled}>
      <SpriteImage src={pokemon.sprite_url} name={pokemon.name} size={64} />
      <span className={styles.name}>{pokemon.name}</span>
      <button
        className={styles.remove}
        onClick={() => onRemove(index)}
        aria-label={`Remove ${pokemon.name}`}
      >
        ✕
      </button>
    </div>
  );
}
