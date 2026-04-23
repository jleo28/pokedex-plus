import Link from 'next/link';
import styles from './page.module.css';

export default function PokemonNotFound() {
  return (
    <main className={styles.page}>
      <p className={styles.dexNumber}>404</p>
      <h1 className={styles.name}>Not found</h1>
      <p style={{ fontFamily: 'var(--font-mono), monospace', color: 'var(--ink-muted)', marginTop: 'var(--space-3)' }}>
        That Pokémon doesn&apos;t exist in the Dex.
      </p>
      <Link href="/pokedex" className={styles.back} style={{ marginTop: 'var(--space-5)', display: 'inline-flex' }}>
        ← Back to Pokédex
      </Link>
    </main>
  );
}
