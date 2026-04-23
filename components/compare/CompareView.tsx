'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SpriteImage } from '@/components/pokedex/SpriteImage';
import { TypeBadge } from '@/components/pokedex/TypeBadge';
import { StatBar } from '@/components/pokedex/StatBar';
import { PokemonPicker } from '@/components/team/PokemonPicker';
import { getDefensiveMatchup } from '@/lib/pokemon/typeChart';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './CompareView.module.css';

const STATS = [
  { key: 'hp',          label: 'HP' },
  { key: 'attack',      label: 'Attack' },
  { key: 'defense',     label: 'Defense' },
  { key: 'sp_attack',   label: 'Sp. Atk' },
  { key: 'sp_defense',  label: 'Sp. Def' },
  { key: 'speed',       label: 'Speed' },
  { key: 'base_stat_total', label: 'Total' },
] as const;

type StatKey = typeof STATS[number]['key'];

interface CompareViewProps {
  allPokemon: Pokemon[];
  initialA: Pokemon | null;
  initialB: Pokemon | null;
}

type Slot = 'a' | 'b';

export function CompareView({ allPokemon, initialA, initialB }: CompareViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);
  const [a, setA] = useState<Pokemon | null>(initialA);
  const [b, setB] = useState<Pokemon | null>(initialB);

  function pick(slot: Slot, pokemon: Pokemon) {
    if (slot === 'a') setA(pokemon);
    else setB(pokemon);
    setPickerSlot(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set(slot, String(pokemon.id));
    router.push(`/compare?${params.toString()}`);
  }

  function delta(key: StatKey): number | null {
    if (!a || !b) return null;
    return (a[key] as number) - (b[key] as number);
  }

  const matchupWinner = (() => {
    if (!a || !b) return null;
    const aMatchup = getDefensiveMatchup(a.type_primary, a.type_secondary);
    const bMatchup = getDefensiveMatchup(b.type_primary, b.type_secondary);
    // bMatchup = types super-effective against B, so if A's type is in there, A has the advantage
    const aHasAdvantage =
      bMatchup.double.includes(a.type_primary) ||
      bMatchup.quad.includes(a.type_primary) ||
      (a.type_secondary && (bMatchup.double.includes(a.type_secondary) || bMatchup.quad.includes(a.type_secondary)));
    // aMatchup = types super-effective against A, so if B's type is in there, B has the advantage
    const bHasAdvantage =
      aMatchup.double.includes(b.type_primary) ||
      aMatchup.quad.includes(b.type_primary) ||
      (b.type_secondary && (aMatchup.double.includes(b.type_secondary) || aMatchup.quad.includes(b.type_secondary)));
    if (aHasAdvantage && !bHasAdvantage) return 'a';
    if (bHasAdvantage && !aHasAdvantage) return 'b';
    return 'tie';
  })();

  return (
    <>
      <div className={styles.pickers}>
        <PokemonSlotButton pokemon={a} onOpen={() => setPickerSlot('a')} label="Pokémon A" />
        <span className={styles.vs}>VS</span>
        <PokemonSlotButton pokemon={b} onOpen={() => setPickerSlot('b')} label="Pokémon B" />
      </div>

      {a && b && (
        <>
          <div className={styles.statTable}>
            <div className={styles.statHeader}>
              <span>{a.name}</span>
              <span className={styles.statHeadMid}>Stat</span>
              <span>{b.name}</span>
            </div>
            {STATS.map(({ key, label }) => {
              const d = delta(key);
              return (
                <div key={key} className={styles.statRow}>
                  <span className={`${styles.val} ${d !== null && d > 0 ? styles.win : ''}`}>
                    {a[key] as number}
                  </span>
                  <span className={styles.statLabel}>{label}</span>
                  <span className={`${styles.val} ${d !== null && d < 0 ? styles.win : ''}`}>
                    {b[key] as number}
                  </span>
                </div>
              );
            })}
          </div>

          {matchupWinner && (
            <div className={styles.matchupNote}>
              {matchupWinner === 'tie'
                ? 'No type advantage either way.'
                : `${matchupWinner === 'a' ? a.name : b.name} has a type advantage.`}
            </div>
          )}
        </>
      )}

      {pickerSlot && (
        <PokemonPicker
          allPokemon={allPokemon}
          onPick={(p) => pick(pickerSlot, p)}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </>
  );
}

function PokemonSlotButton({
  pokemon, onOpen, label,
}: { pokemon: Pokemon | null; onOpen: () => void; label: string }) {
  return (
    <button className={styles.slot} onClick={onOpen} aria-label={label}>
      {pokemon ? (
        <div className={styles.slotFilled}>
          <SpriteImage src={pokemon.sprite_url} name={pokemon.name} size={80} />
          <span className={styles.slotName}>{pokemon.name}</span>
          <div className={styles.slotTypes}>
            <TypeBadge type={pokemon.type_primary} />
            {pokemon.type_secondary && <TypeBadge type={pokemon.type_secondary} />}
          </div>
        </div>
      ) : (
        <span className={styles.slotEmpty}>+ Pick</span>
      )}
    </button>
  );
}
