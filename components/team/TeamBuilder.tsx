'use client';

import { useState } from 'react';
import { TeamSlot } from './TeamSlot';
import { PokemonPicker } from './PokemonPicker';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './TeamBuilder.module.css';

interface TeamBuilderProps {
  allPokemon: Pokemon[];
}

export function TeamBuilder({ allPokemon }: TeamBuilderProps) {
  const [team, setTeam] = useState<(Pokemon | null)[]>(Array(6).fill(null));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  function handleAdd(index: number) {
    setActiveSlot(index);
  }

  function handleRemove(index: number) {
    setTeam((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  function handlePick(pokemon: Pokemon) {
    if (activeSlot === null) return;
    setTeam((prev) => {
      const next = [...prev];
      next[activeSlot] = pokemon;
      return next;
    });
    setActiveSlot(null);
  }

  function handleClose() {
    setActiveSlot(null);
  }

  return (
    <>
      <div className={styles.slots}>
        {team.map((pokemon, i) => (
          <TeamSlot
            key={i}
            index={i}
            pokemon={pokemon}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {activeSlot !== null && (
        <PokemonPicker
          allPokemon={allPokemon}
          onPick={handlePick}
          onClose={handleClose}
        />
      )}
    </>
  );
}
