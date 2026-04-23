import { Suspense } from 'react';
import { getAllPokemon, getPokemonByIds } from '@/lib/pokemon/queries';
import { CompareView } from '@/components/compare/CompareView';
import styles from './page.module.css';

export const revalidate = 86400;

interface PageProps {
  searchParams: { a?: string; b?: string };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const [allPokemon, selected] = await Promise.all([
    getAllPokemon(),
    getPokemonByIds(
      [Number(searchParams.a), Number(searchParams.b)].filter((n) => n > 0),
    ),
  ]);

  const pokemonA = selected.find((p) => p.id === Number(searchParams.a)) ?? null;
  const pokemonB = selected.find((p) => p.id === Number(searchParams.b)) ?? null;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Compare</h1>
        <p className={styles.subtitle}>Pick two Pokémon to compare stats head-to-head.</p>
      </div>
      <Suspense>
        <CompareView allPokemon={allPokemon} initialA={pokemonA} initialB={pokemonB} />
      </Suspense>
    </main>
  );
}
