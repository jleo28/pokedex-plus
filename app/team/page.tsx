import { getAllPokemon } from '@/lib/pokemon/queries';
import { TeamBuilder } from '@/components/team/TeamBuilder';
import styles from './page.module.css';

export const revalidate = 86400;

export default async function TeamPage() {
  const allPokemon = await getAllPokemon();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Team Builder</h1>
        <p className={styles.subtitle}>Build your party of 6</p>
      </div>
      <TeamBuilder allPokemon={allPokemon} />
    </main>
  );
}
