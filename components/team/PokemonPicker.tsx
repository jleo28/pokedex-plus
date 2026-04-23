'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SpriteImage } from '@/components/pokedex/SpriteImage';
import { TypeBadge } from '@/components/pokedex/TypeBadge';
import type { Pokemon } from '@/lib/pokemon/types';
import styles from './PokemonPicker.module.css';

interface PokemonPickerProps {
  allPokemon: Pokemon[];
  onPick: (pokemon: Pokemon) => void;
  onClose: () => void;
}

export function PokemonPicker({ allPokemon, onPick, onClose }: PokemonPickerProps) {
  const [query, setQuery] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? allPokemon.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        String(p.id).includes(query)
      )
    : allPokemon;

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ESC to close + focus trap
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const modal = (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label="Pick a Pokémon"
      >
        <div className={styles.header}>
          <span className={styles.title}>Choose a Pokémon</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close picker">✕</button>
        </div>

        <input
          ref={inputRef}
          className={styles.search}
          type="search"
          placeholder="Search by name or #…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className={styles.grid} role="listbox">
          {filtered.map((pokemon) => (
            <button
              key={pokemon.id}
              className={styles.card}
              onClick={() => onPick(pokemon)}
              role="option"
              aria-selected={false}
            >
              <SpriteImage src={pokemon.sprite_url} name={pokemon.name} size={48} />
              <span className={styles.name}>{pokemon.name}</span>
              <div className={styles.types}>
                <TypeBadge type={pokemon.type_primary} />
                {pokemon.type_secondary && <TypeBadge type={pokemon.type_secondary} />}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className={styles.empty}>No Pokémon found.</p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
