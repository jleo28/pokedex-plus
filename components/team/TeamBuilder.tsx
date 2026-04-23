'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableSlot } from './SortableSlot';
import { PokemonPicker } from './PokemonPicker';
import { TypeCoverageMatrix } from './TypeCoverageMatrix';
import { DefensiveSummary } from './DefensiveSummary';
import { TeamStatRadar } from './TeamStatRadar';
import { encodeTeam } from '@/lib/pokemon/team-code';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './TeamBuilder.module.css';

interface TeamBuilderProps {
  allPokemon: Pokemon[];
  initialTeam?: (Pokemon | null)[];
  readOnly?: boolean;
}

const SLOT_IDS = ['slot-0', 'slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5'];

export function TeamBuilder({ allPokemon, initialTeam, readOnly = false }: TeamBuilderProps) {
  const router = useRouter();
  const [team, setTeam] = useState<(Pokemon | null)[]>(
    initialTeam ?? Array(6).fill(null),
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [copied, setCopied] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const from = SLOT_IDS.indexOf(active.id as string);
      const to   = SLOT_IDS.indexOf(over.id as string);
      if (from === -1 || to === -1) return;
      setTeam((prev) => {
        const next = arrayMove(prev, from, to);
        setAnnouncement(`${prev[from]?.name ?? 'Empty slot'} moved to slot ${to + 1}.`);
        return next;
      });
    },
    [],
  );

  function handleAdd(index: number) { setActiveSlot(index); }

  function handleRemove(index: number) {
    setTeam((prev) => {
      const next = [...prev];
      setAnnouncement(`${next[index]?.name ?? 'Pokémon'} removed from slot ${index + 1}.`);
      next[index] = null;
      return next;
    });
  }

  function handlePick(pokemon: Pokemon) {
    if (activeSlot === null) return;
    setTeam((prev) => {
      const next = [...prev];
      next[activeSlot] = pokemon;
      setAnnouncement(`${pokemon.name} added to slot ${activeSlot + 1}.`);
      return next;
    });
    setActiveSlot(null);
  }

  function handleShare() {
    const ids = team.map((p) => p?.id ?? null);
    const code = encodeTeam(ids);
    router.push(`/team/${code}`);
  }

  async function handleCopyLink() {
    const ids = team.map((p) => p?.id ?? null);
    const code = encodeTeam(ids);
    const url = `${window.location.origin}/team/${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasAny = team.some(Boolean);

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic className={styles.srOnly}>
        {announcement}
      </div>

      {readOnly ? (
        <div className={styles.slots}>
          {team.map((pokemon, i) => (
            <SortableSlot
              key={SLOT_IDS[i]}
              id={SLOT_IDS[i]}
              index={i}
              pokemon={pokemon}
              onAdd={() => {}}
              onRemove={() => {}}
            />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={SLOT_IDS} strategy={rectSortingStrategy}>
            <div className={styles.slots}>
              {team.map((pokemon, i) => (
                <SortableSlot
                  key={SLOT_IDS[i]}
                  id={SLOT_IDS[i]}
                  index={i}
                  pokemon={pokemon}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!readOnly && hasAny && (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleShare}>Share Team</button>
          <button className={styles.actionBtn} onClick={handleCopyLink}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {readOnly && (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleCopyLink}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a className={styles.actionBtn} href="/team">Remix This Team</a>
        </div>
      )}

      {hasAny && (
        <div className={styles.analysis}>
          <section>
            <h2 className={styles.sectionHead}>Type coverage</h2>
            <TypeCoverageMatrix team={team} />
          </section>
          <div className={styles.twoCol}>
            <section>
              <h2 className={styles.sectionHead}>Defensive weaknesses</h2>
              <DefensiveSummary team={team} />
            </section>
            <section>
              <h2 className={styles.sectionHead}>Stat radar</h2>
              <TeamStatRadar team={team} />
            </section>
          </div>
        </div>
      )}

      {activeSlot !== null && (
        <PokemonPicker
          allPokemon={allPokemon}
          onPick={handlePick}
          onClose={() => setActiveSlot(null)}
        />
      )}
    </>
  );
}
