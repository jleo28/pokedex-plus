import type { PokemonType } from '@/lib/pokemon/types';
import styles from './TypeBadge.module.css';

const TYPE_COLORS: Record<PokemonType, string> = {
  normal:   '#a8a77a',
  fire:     '#ee8130',
  water:    '#6390f0',
  electric: '#f7d02c',
  grass:    '#7ac74c',
  ice:      '#96d9d6',
  fighting: '#c22e28',
  poison:   '#a33ea1',
  ground:   '#e2bf65',
  flying:   '#a98ff3',
  psychic:  '#f95587',
  bug:      '#a6b91a',
  rock:     '#b6a136',
  ghost:    '#735797',
  dragon:   '#6f35fc',
  dark:     '#705746',
  steel:    '#b7b7ce',
  fairy:    '#d685ad',
};

// Types where white text is hard to read — use dark ink instead
const DARK_TEXT_TYPES = new Set<PokemonType>(['electric', 'ground', 'ice', 'steel', 'normal']);

interface TypeBadgeProps {
  type: PokemonType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const bg = TYPE_COLORS[type] ?? '#a8a77a';
  // Darken by ~20% for border
  const border = bg;
  const color = DARK_TEXT_TYPES.has(type) ? '#1a1a1a' : '#fff';

  return (
    <span
      className={[styles.badge, className ?? ''].filter(Boolean).join(' ')}
      style={{ backgroundColor: bg, borderColor: border, color }}
    >
      {type}
    </span>
  );
}
