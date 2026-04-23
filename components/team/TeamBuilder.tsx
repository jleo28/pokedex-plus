'use client';

import { useState } from 'react';
import { TeamSlot } from './TeamSlot';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './TeamBuilder.module.css';

export function TeamBuilder() {
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

  function handleClose() {
    setActiveSlot(null);
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
        <PokemonPickerModal onPick={handlePick} onClose={handleClose} />
      )}
    </>
  );
}

// Lazy import to avoid circular deps — picker lives in same file for Task 19 stub
function PokemonPickerModal({
  onPick,
  onClose,
}: {
  onPick: (p: Pokemon) => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modalNote}>Picker coming in Task 20…</p>
        <button className={styles.modalClose} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
