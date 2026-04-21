import { Suspense } from 'react';
import { getAllPokemon } from '@/lib/pokemon/queries';
import { PokedexCard } from '@/components/pokedex/PokedexCard';
import { PokedexFilters } from '@/components/pokedex/PokedexFilters';
import styles from './page.module.css';

export const revalidate = 86400;

interface PageProps {
  searchParams: { gen?: string; type?: string; legendary?: string; q?: string };
}

export default async function PokedexPage({ searchParams }: PageProps) {
  const pokemon = await getAllPokemon(searchParams);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pokédex</h1>
        <p className={styles.count}>{pokemon.length} Pokémon</p>
      </div>

      <Suspense>
        <PokedexFilters />
      </Suspense>

      <div className={styles.grid}>
        {pokemon.length === 0 ? (
          <div className={styles.empty}>No Pokémon found.</div>
        ) : (
          pokemon.map((p) => <PokedexCard key={p.id} pokemon={p} />)
        )}
      </div>
    </main>
  );
}
