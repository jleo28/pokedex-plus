import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>
        Pokédex<span>++</span>
      </h1>
      <p className={styles.tagline}>
        All 386 Gen 1–3 Pokémon. Team builder. ML predictions.
      </p>
      <div className={styles.cta}>
        <Link href="/pokedex" className={styles.ctaButton}>
          Browse the Dex
        </Link>
      </div>
    </main>
  );
}
