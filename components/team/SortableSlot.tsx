'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TeamSlot } from './TeamSlot';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './SortableSlot.module.css';

interface SortableSlotProps {
  id: string;
  index: number;
  pokemon: Pokemon | null;
  onAdd: (index: number) => void;
  onRemove: (index: number) => void;
}

export function SortableSlot({ id, index, pokemon, onAdd, onRemove }: SortableSlotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.wrapper}
      {...attributes}
      {...listeners}
    >
      <TeamSlot
        index={index}
        pokemon={pokemon}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    </div>
  );
}
