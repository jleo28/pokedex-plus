import Link from 'next/link';
import { getAllPokemon } from '@/lib/pokemon/queries';
import { SpriteImage } from '@/components/pokedex/SpriteImage';
import { TypeBadge } from '@/components/pokedex/TypeBadge';
import styles from './page.module.css';

export const revalidate = 86400;

const FEATURED_IDS = [6, 150, 94, 133, 25];

export default async function HomePage() {
  const all = await getAllPokemon();
  const featured = FEATURED_IDS.map((id) => all.find((p) => p.id === id)).filter(Boolean);

  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Pokédex<span>++</span>
          </h1>
          <p className={styles.tagline}>
            386 Pokémon. Two sklearn models. One rebuild of my ITP-216 final project,
            this time with Next.js, Supabase, and actual ML predictions.
          </p>
          <div className={styles.cta}>
            <Link href="/pokedex" className={styles.ctaButton}>Browse the Dex</Link>
            <Link href="/team"    className={`${styles.ctaButton} ${styles.secondary}`}>Build a Team</Link>
            <Link href="/lab"     className={`${styles.ctaButton} ${styles.secondary}`}>ML Lab</Link>
          </div>
        </section>

        <section className={styles.featured}>
          <h2 className={styles.featuredTitle}>Featured</h2>
          <div className={styles.featuredGrid}>
            {featured.map((p) => p && (
              <Link key={p.id} href={`/pokedex/${p.slug}`} className={styles.featuredCard}>
                <SpriteImage src={p.sprite_url} name={p.name} size={80} className={styles.featuredSprite} />
                <span className={styles.featuredName}>{p.name}</span>
                <div className={styles.featuredTypes}>
                  <TypeBadge type={p.type_primary} />
                  {p.type_secondary && <TypeBadge type={p.type_secondary} />}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.about}>
          <p className={styles.aboutText}>
            This is a rebuild of my 2023 ITP-216 final project. It&apos;s a Pokédex.
            It also has two sklearn models doing real predictions: one regresses Base Stat Total
            from physical traits, one classifies legendary status from the six base stats.
            Built with Next.js 14, Supabase, and Vercel&apos;s Python runtime for inference.
          </p>
          <div className={styles.extLinks}>
            <a href="https://jleo.me" className={styles.extLink} target="_blank" rel="noopener noreferrer">jleo.me</a>
            <a href="https://github.com/jleo28/pokedex-plus" className={styles.extLink} target="_blank" rel="noopener noreferrer">github.com/jleo28/pokedex-plus</a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© 2024 jleo28 · Pokémon data from PokéAPI · Not affiliated with Nintendo or Game Freak</span>
      </footer>
    </>
  );
}
