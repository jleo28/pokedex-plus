'use client';

import { useState } from 'react';
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
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './TeamBuilder.module.css';

interface TeamBuilderProps {
  allPokemon: Pokemon[];
}

export function TeamBuilder({ allPokemon }: TeamBuilderProps) {
  const [team, setTeam] = useState<(Pokemon | null)[]>(Array(6).fill(null));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const slotIds = ['slot-0', 'slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5'];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = slotIds.indexOf(active.id as string);
    const to = slotIds.indexOf(over.id as string);
    if (from === -1 || to === -1) return;

    setTeam((prev) => arrayMove(prev, from, to));

    const movedName = team[from]?.name ?? 'Empty slot';
    setAnnouncement(`${movedName} moved from slot ${from + 1} to slot ${to + 1}.`);
  }

  function handleAdd(index: number) {
    setActiveSlot(index);
  }

  function handleRemove(index: number) {
    setTeam((prev) => {
      const next = [...prev];
      const name = next[index]?.name ?? 'Pokémon';
      next[index] = null;
      setAnnouncement(`${name} removed from slot ${index + 1}.`);
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
    setAnnouncement(`${pokemon.name} added to slot ${activeSlot + 1}.`);
    setActiveSlot(null);
  }

  return (
    <>
      {/* Screen reader live region */}
      <div role="status" aria-live="polite" aria-atomic className={styles.srOnly}>
        {announcement}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={slotIds} strategy={rectSortingStrategy}>
          <div className={styles.slots}>
            {team.map((pokemon, i) => (
              <SortableSlot
                key={slotIds[i]}
                id={slotIds[i]}
                index={i}
                pokemon={pokemon}
                onAdd={handleAdd}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
