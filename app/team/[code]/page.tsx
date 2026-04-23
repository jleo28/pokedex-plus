import { notFound } from 'next/navigation';
import { decodeTeam } from '@/lib/pokemon/team-code';
import { getPokemonByIds, getAllPokemon } from '@/lib/pokemon/queries';
import { TeamBuilder } from '@/components/team/TeamBuilder';
import styles from './page.module.css';

export const revalidate = 3600;

interface PageProps {
  params: { code: string };
}

export default async function SharedTeamPage({ params }: PageProps) {
  const ids = decodeTeam(params.code);
  if (ids.length === 0) notFound();

  const [teamPokemon, allPokemon] = await Promise.all([
    getPokemonByIds(ids),
    getAllPokemon(),
  ]);

  // Rebuild ordered team (preserve slot order from code, nulls for 000)
  const codeSlots = params.code.split('-').map(Number);
  const byId = new Map(teamPokemon.map((p) => [p.id, p]));
  const orderedTeam = codeSlots.map((id) => byId.get(id) ?? null);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shared Team</h1>
        <p className={styles.subtitle}>View-only snapshot</p>
      </div>
      <TeamBuilder allPokemon={allPokemon} initialTeam={orderedTeam} readOnly />
    </main>
  );
}
